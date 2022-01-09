import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { WebRtcService } from '../webrtc.service';
import { AddPeerResponse } from './types';

@Injectable()
export class ChatService {
  private SOCKET_URL = 'http://localhost:3000/';
  private socket: Socket | null = null;
  activeUsers$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  constructor(private webrtcService: WebRtcService) {
    this.socket = io(this.SOCKET_URL);
    this.socket.on('update-user-list', ({ users }) => {
      const activeUsersCurrentValue = this.activeUsers$.getValue();
      activeUsersCurrentValue.push(...users);
      this.activeUsers$.next(activeUsersCurrentValue);
    });

    this.socket.on('remove-user', ({ socketId }) => {
      const activeUsersCurrentValue = this.activeUsers$.getValue();
      this.activeUsers$.next(
        activeUsersCurrentValue.filter((userId) => userId !== socketId)
      );
      this.webrtcService.remoteStream$.next(new MediaStream());
    });

    this.socket.on('call-made', async (data) => {
      await this.webrtcService.pc.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );
      const answer = await this.webrtcService.pc.createAnswer();
      await this.webrtcService.pc.setLocalDescription(
        new RTCSessionDescription(answer)
      );

      this.socket?.emit('make-answer', {
        answer,
        to: data.socket,
      });
    });

    this.socket.on('answer-made', async (data) => {
      await this.webrtcService.pc.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
    });
  }

  callUser = async (socketId: string) => {
    const offer = await this.webrtcService.pc.createOffer();
    await this.webrtcService.pc.setLocalDescription(offer);

    this.socket?.emit('call-user', {
      offer,
      to: socketId,
    });
  };
}
