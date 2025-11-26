import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

type SfxId = 'click' | 'hover' | 'error' | 'success' | 'notification';
type AmbienceMood = 'calm' | 'unrest' | 'war' | 'boom';

interface AudioContextValue {
    playSfx: (id: SfxId) => void;
    setAmbience: (mood: AmbienceMood) => void;
    currentMood: AmbienceMood;
}

const AudioContext = createContext<AudioContextValue | null>(null);

const SFX_SOURCES: Record<SfxId, string> = {
    click: '/audio/ui_click.mp3',
    hover: '/audio/ui_hover.mp3',
    error: '/audio/ui_error.mp3',
    success: '/audio/ui_success.mp3',
    notification: '/audio/ui_notification.mp3'
};

const AMBIENCE_SOURCES: Record<AmbienceMood, string> = {
    calm: '/audio/ambience_calm.mp3',
    unrest: '/audio/ambience_unrest.mp3',
    war: '/audio/ambience_war.mp3',
    boom: '/audio/ambience_boom.mp3'
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const sfxCache = useMemo(() => new Map<SfxId, HTMLAudioElement>(), []);
    const ambienceRef = useRef<HTMLAudioElement | null>(null);
    const [currentMood, setCurrentMood] = useState<AmbienceMood>('calm');

    const playSfx = (id: SfxId) => {
        if (!sfxCache.has(id)) {
            const audio = new Audio(SFX_SOURCES[id]);
            audio.volume = 0.3;
            sfxCache.set(id, audio);
        }
        const audio = sfxCache.get(id)!;
        audio.currentTime = 0;
        void audio.play();
    };

    const setAmbience = (mood: AmbienceMood) => {
        if (mood === currentMood) return;
        setCurrentMood(mood);
        if (ambienceRef.current) {
            ambienceRef.current.pause();
        }
        const audio = new Audio(AMBIENCE_SOURCES[mood]);
        audio.loop = true;
        audio.volume = 0.2;
        ambienceRef.current = audio;
        void audio.play();
    };

    useEffect(() => {
        // set default ambience
        setAmbience('calm');
        return () => {
            ambienceRef.current?.pause();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AudioContext.Provider value={{ playSfx, setAmbience, currentMood }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = (): AudioContextValue => {
    const ctx = useContext(AudioContext);
    if (!ctx) throw new Error('useAudio must be used within AudioProvider');
    return ctx;
};
