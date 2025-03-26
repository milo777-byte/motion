import { Injectable } from '@angular/core';
import { Motion } from '@capacitor/motion';
import { PluginListenerHandle } from '@capacitor/core';
import { MotionData } from '../Model/MotionData.model';

@Injectable({
  providedIn: 'root'
})
export class MotionService {
  private accelListener?: PluginListenerHandle;
  private gyroListener?: PluginListenerHandle;

  private lastAcceleration = 9.81; // Aproximadamente 1G (m/s²)
  private isFalling = false;

  constructor() { }

  async startMotionDetection(callback: (data: MotionData) => void) {
    const motionData: MotionData = {};

    this.accelListener = await Motion.addListener('accel', (event) => {
      if (event.acceleration) {
        motionData.acceleration = event.acceleration;
        this.detectFall(event.acceleration);
        callback(motionData);
      }
    });

    this.gyroListener = await Motion.addListener('orientation', (event) => {
      motionData.rotation = {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma
      };
      callback(motionData);
    });
  }

  async stopMotionDetection() {
    if (this.accelListener) {
      await this.accelListener.remove();
    }
    if (this.gyroListener) {
      await this.gyroListener.remove();
    }
  }

  private detectFall(acceleration: { x: number, y: number, z: number }) {
    const totalAcceleration = Math.sqrt(
      acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2
    );

    if (totalAcceleration < 0.5 * 9.81) {
      // Posible caída libre detectada
      this.isFalling = true;
    } else if (this.isFalling && totalAcceleration > 2 * 9.81) {
      // Impacto detectado después de caída libre
      this.isFalling = false;
      this.onFallDetected();
    }

    this.lastAcceleration = totalAcceleration;
  }

  private onFallDetected() {
    console.log('🚨 ¡Caída detectada!');
    alert('¡Posible caída detectada!'); // Puedes reemplazar esto con una acción real (enviar alerta, registrar evento, etc.)
  }
}
