import pyaudio
import threading
import socketio
import sys
import pygame
import queue
import signal

try:
    if len(sys.argv) != 3:
        raise Exception("Bad Parameters") 
except KeyboardInterrupt:
    exit()

sio = socketio.Client()

class AudioThread:
    def __init__(self):
        threading.Thread.__init__(self)
        self.Stop = False
        self.Muted = False
        self.CHUNK = 16000
        self.FORMAT = pyaudio.paInt16
        self.CHANNELS = 1
        self.RATE = 44100
        self.p = pyaudio.PyAudio()

        self.recv_queue = queue.Queue()

        pygame.mixer.init(frequency=22050, size=-16, channels=1, buffer=512)

    def playback_queue(self, data):
        self.recv_queue.put(data)
        return

    def __playback(self):
        pygame.mixer.set_num_channels(50)
        pygame.mixer.music
        while not self.Stop:
            if(not self.recv_queue.empty()):
                data = self.recv_queue.get()
                channel = pygame.mixer.find_channel(True)
                channel.play(pygame.mixer.Sound(buffer=data))
                channel.set_volume(1.0)
        return  

    def __record(self):
        stream = self.p.open(format = self.FORMAT,
                        channels = self.CHANNELS,
                        rate = self.RATE,
                        input = True,
                        frames_per_buffer = self.CHUNK)
        
        while not self.Stop:
            if not self.Muted:
                in_data = stream.read(self.CHUNK, exception_on_overflow=False)
                sio.emit("send voice chat", (self.roomid, in_data))
        
        stream.close()
        return

    def run(self, server_ip: str,roomid: str):
        self.roomid = roomid
        signal.signal(signal.SIGINT, self.stop)
        sio.connect(server_ip)
        sio.emit("Join Private Voice", (self.roomid))
        record = threading.Thread(target=self.__record)
        playback = threading.Thread(target=self.__playback)

        record.start()
        playback.start()

    def mute(self):
        self.Muted = not self.Muted

    def stop(self):
        self.Stop = True
        self.p.terminate()


audio = AudioThread()
@sio.event
def connect():
    print('connection established')

@sio.on('get voice chat')
def on_message(data):
    audio.playback_queue(data)

@sio.on('mute voice chat')
def on_message():
    audio.mute()

@sio.event
def disconnect():
    print('disconnected from server')
    audio.stop()

audio.run(sys.argv[1], sys.argv[2])
sio.wait()
