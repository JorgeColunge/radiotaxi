package com.axiomarobotics.radiotaxi;

import android.Manifest;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.media.AudioManager;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.KeyEvent;

import androidx.core.app.ActivityCompat;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.InputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import org.json.JSONObject;

public class MainActivity extends BridgeActivity implements LocationListener {
    private static final String TAG = "MainActivity";
    private static final int LONG_PRESS_DELAY = 3000; // 3 segundos
    private boolean isVolumeButtonPressed = false;
    private Handler handler = new Handler();
    private LocationManager locationManager;
    private double latitude;
    private double longitude;

    private Runnable longPressRunnable = new Runnable() {
        @Override
        public void run() {
            if (isVolumeButtonPressed) {
                isVolumeButtonPressed = false;
                Log.d(TAG, "Volume Up button long press detected");
                requestLocationAndSendPanicAlert();
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setVolumeControlStream(AudioManager.STREAM_MUSIC);
        Log.d(TAG, "MainActivity created");

        // Inicializar LocationManager
        locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);

        // Verificar y solicitar permisos de ubicación si es necesario
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
                && ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, 1);
        } else {
            locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0, 0, this);
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_VOLUME_UP) {
            if (!isVolumeButtonPressed) {
                isVolumeButtonPressed = true;
                handler.postDelayed(longPressRunnable, LONG_PRESS_DELAY);
                Log.d(TAG, "Volume Up button pressed");
            }
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    public boolean onKeyUp(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_VOLUME_UP) {
            if (isVolumeButtonPressed) {
                isVolumeButtonPressed = false;
                handler.removeCallbacks(longPressRunnable);
                Log.d(TAG, "Volume Up button released");
            }
            return true;
        }
        return super.onKeyUp(keyCode, event);
    }

    private void requestLocationAndSendPanicAlert() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
                && ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            Log.e(TAG, "Location permissions are not granted");
            return;
        }
        Location location = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
        if (location != null) {
            latitude = location.getLatitude();
            longitude = location.getLongitude();
            Log.d(TAG, "Location obtained: Latitude: " + latitude + ", Longitude: " + longitude);
            sendPanicAlert();
        } else {
            Log.e(TAG, "Failed to obtain location");
        }
    }

    private void sendPanicAlert() {
        Log.d(TAG, "Sending panic alert");

        new Thread(() -> {
            HttpURLConnection conn = null;
            try {
                URL url = new URL("https://radiotaxi.axiomarobotics.com:10000/api/geolocation/panic2");
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);

                String jsonInputString = String.format("{\"latitude\": \"%s\", \"longitude\": \"%s\"}", latitude, longitude);
                Log.d(TAG, "Sending data: " + jsonInputString);

                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = jsonInputString.getBytes("utf-8");
                    os.write(input, 0, input.length);
                }

                int code = conn.getResponseCode();
                Log.d(TAG, "HTTP Response code: " + code);

                if (code == 200) {
                    // Leer la respuesta
                    InputStream inputStream = conn.getInputStream();
                    BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();
                    JSONObject jsonResponse = new JSONObject(response.toString());
                    String nearestUserId = jsonResponse.getString("nearestUser");
                    Log.d(TAG, "Nearest User ID: " + nearestUserId);

                    // Enviar alerta de pánico con el id_usuario del usuario más cercano
                    sendPanicAlertWithUserId(nearestUserId);
                } else {
                    Log.e(TAG, "HTTP Error: " + code);
                }

            } catch (Exception e) {
                Log.e(TAG, "Error sending panic alert", e);
            } finally {
                if (conn != null) {
                    conn.disconnect();
                }
            }
        }).start();
    }

    private void sendPanicAlertWithUserId(String idUsuario) {
        Log.d(TAG, "Sending panic alert with user ID: " + idUsuario);

        new Thread(() -> {
            HttpURLConnection conn = null;
            try {
                URL url = new URL("https://radiotaxi.axiomarobotics.com:10000/api/geolocation/panic");
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);

                String jsonInputString = String.format("{\"id_usuario\": \"%s\"}", idUsuario);
                Log.d(TAG, "Sending data: " + jsonInputString);

                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = jsonInputString.getBytes("utf-8");
                    os.write(input, 0, input.length);
                }

                int code = conn.getResponseCode();
                Log.d(TAG, "HTTP Response code: " + code);

                if (code != 200) {
                    Log.e(TAG, "HTTP Error: " + code);
                }

            } catch (Exception e) {
                Log.e(TAG, "Error sending panic alert with user ID", e);
            } finally {
                if (conn != null) {
                    conn.disconnect();
                }
            }
        }).start();
    }

    @Override
    public void onLocationChanged(Location location) {
        latitude = location.getLatitude();
        longitude = location.getLongitude();
        Log.d(TAG, "Location updated: Latitude: " + latitude + ", Longitude: " + longitude);
    }

    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) {}

    @Override
    public void onProviderEnabled(String provider) {}

    @Override
    public void onProviderDisabled(String provider) {}
}
