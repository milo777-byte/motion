import { Component, OnInit, OnDestroy } from '@angular/core';
import { MotionService } from './Services/motion.service';
import { MotionData } from './Model/MotionData.model';
import { CommonModule } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';


@Component({
  selector: 'app-motion',
  imports: [CommonModule],
  templateUrl: './motion.component.html',
  styleUrl: './motion.component.scss'
})
export class MotionComponent implements OnInit, OnDestroy {
  motionData: MotionData = {};
  fallDetected = false;

  constructor(private motionS: MotionService) {}

  async ngOnInit() {
    this.motionS.startMotionDetection((data: MotionData) => {
      this.motionData = data;
      if (this.motionS['isFalling']) {
        this.fallDetected = true;
        this.sendNotification();
      } else {
        this.fallDetected = false;
      }
    });

    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.requestPermissions();
    }
  }

  ngOnDestroy(): void {
    this.motionS.stopMotionDetection();
  }

  async sendNotification() {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: '⚠️ ¡Alerta de caída!',
          body: 'Se ha detectado una posible caída.',
          id: 1,
          schedule: { at: new Date(Date.now() + 1000) }, // 1 segundo después
          sound: 'fall_alert.wav',
          attachments: [],
          actionTypeId: '',
          extra: null
        }
      ]
    });
  }
}