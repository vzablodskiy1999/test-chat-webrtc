import { Component, OnInit } from '@angular/core';
import { ChatService } from 'src/services/chat/chat.service';
import { WebRtcService } from 'src/services/webrtc.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  localVideoSource?: MediaStream;
  remoteVideoSource?: MediaStream;
  activeUsers?: string[];

  constructor(
    private webRtcService: WebRtcService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.webRtcService.localStream$.subscribe((stream) => {
      this.localVideoSource = stream;
    });

    this.webRtcService.remoteStream$.subscribe((stream) => {
      this.remoteVideoSource = stream;
    });

    this.chatService.activeUsers$.subscribe((users) => {
      this.activeUsers = users;
    });
  }

  callUser(socketId: string): void {
    this.chatService.callUser(socketId);
  }
}
