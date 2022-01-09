import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class WebRtcService {
  localStream$ = new BehaviorSubject<MediaStream>(new MediaStream());
  remoteStream$ = new BehaviorSubject<MediaStream>(new MediaStream());
  pc: RTCPeerConnection;
  private constraints: MediaStreamConstraints = {
    audio: false,
    video: true,
  };
  private stunConfig: RTCConfiguration = {
    iceServers: [
      {
        urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  constructor() {
    this.pc = new RTCPeerConnection(this.stunConfig);
    this.pc.ontrack = (event) => this.setupRemoteStreamTracks(event);
    navigator.mediaDevices.getUserMedia(this.constraints).then((stream) => {
      this.localStream$.next(stream);
      stream.getTracks().forEach((track) => {
        this.pc.addTrack(track, stream);
      });
    });
  }

  setupRemoteStreamTracks = (event: RTCTrackEvent) => {
    this.remoteStream$.next(event.streams[0]);
  };
}
