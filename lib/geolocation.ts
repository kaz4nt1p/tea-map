/**
 * Geolocation utilities for Tea Map application
 * Handles browser geolocation API with proper error handling
 */

export interface GeolocationPosition {
  lat: number;
  lng: number;
  accuracy?: number;
}

export enum GeolocationErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  POSITION_UNAVAILABLE = 'POSITION_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  UNKNOWN = 'UNKNOWN',
}

export interface GeolocationError {
  type: GeolocationErrorType;
  message: string;
  nativeError?: GeolocationPositionError;
}

/**
 * Check if geolocation is supported by the browser
 */
export function isGeolocationSupported(): boolean {
  return 'geolocation' in navigator;
}

/**
 * Get the user's current position
 * Returns a Promise that resolves with coordinates or rejects with error
 */
export function getCurrentPosition(
  options: PositionOptions = {}
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject({
        type: GeolocationErrorType.NOT_SUPPORTED,
        message: 'Ваш браузер не поддерживает геолокацию',
      } as GeolocationError);
      return;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 0, // Don't use cached position
    };

    const finalOptions = { ...defaultOptions, ...options };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let errorType: GeolocationErrorType;
        let errorMessage: string;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorType = GeolocationErrorType.PERMISSION_DENIED;
            errorMessage = 'Разрешите доступ к геолокации в настройках браузера';
            break;
          case error.POSITION_UNAVAILABLE:
            errorType = GeolocationErrorType.POSITION_UNAVAILABLE;
            errorMessage = 'Не удалось определить местоположение';
            break;
          case error.TIMEOUT:
            errorType = GeolocationErrorType.TIMEOUT;
            errorMessage = 'Превышено время ожидания геолокации';
            break;
          default:
            errorType = GeolocationErrorType.UNKNOWN;
            errorMessage = 'Произошла ошибка при получении геолокации';
        }

        reject({
          type: errorType,
          message: errorMessage,
          nativeError: error,
        } as GeolocationError);
      },
      finalOptions
    );
  });
}

/**
 * Get user-friendly error message for geolocation errors
 */
export function getGeolocationErrorMessage(error: GeolocationError): string {
  return error.message;
}
