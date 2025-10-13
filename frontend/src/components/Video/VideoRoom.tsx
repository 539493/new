import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { JITSI_DOMAIN, JAAS_ENABLED } from '../../config';
import { SERVER_URL } from '../../config';

const VideoRoom: React.FC = () => {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const apiRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (!lessonId || !user) return;

    const useJaas = JAAS_ENABLED;
    if (!useJaas) {
      const allowIframe = (import.meta as any).env?.VITE_JITSI_ALLOW_IFRAME === 'true';
      if (JITSI_DOMAIN === 'meet.jit.si' && !allowIframe) {
        const displayName = encodeURIComponent(user.name || user.nickname || 'User');
        const url = `https://${JITSI_DOMAIN}/lesson_${lessonId}#userInfo.displayName=${displayName}`;
        window.location.replace(url);
        return;
      }
    }

    const ensureApi = () =>
      new Promise<void>((resolve, reject) => {
        if ((window as any).JitsiMeetExternalAPI) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.id = 'jitsi-external-api';
        script.src = `https://${JITSI_DOMAIN}/external_api.js`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Jitsi API'));
        document.body.appendChild(script);
      });

    let cleanup: (() => void) | null = null;

    (async () => {
      try {
        await ensureApi();
        if (!containerRef.current) return;

        let jwt: string | undefined = undefined;
        if (useJaas) {
          try {
            const resp = await fetch(`${SERVER_URL}/api/jaas/token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                room: `lesson_${lessonId}`,
                userId: user.id,
                userName: user.name || user.nickname || 'User'
              })
            });
            const data = await resp.json();
            jwt = data.token;
          } catch (e) {
            const displayName = encodeURIComponent(user.name || user.nickname || 'User');
            const url = `https://${JITSI_DOMAIN}/lesson_${lessonId}#userInfo.displayName=${displayName}`;
            window.location.replace(url);
            return;
          }
        }

        const options: any = {
          roomName: `lesson_${lessonId}`,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          userInfo: { displayName: user.name || user.nickname || 'User' },
          configOverwrite: {
            prejoinPageEnabled: true,
          },
          interfaceConfigOverwrite: {
            HIDE_INVITE_MORE_HEADER: true,
          },
        };
        if (jwt) options.jwt = jwt;

        const JitsiAPI = (window as any).JitsiMeetExternalAPI;
        apiRef.current = new JitsiAPI(JITSI_DOMAIN, options);

        apiRef.current.addListener('readyToClose', () => {
          navigate(-1);
        });

        cleanup = () => {
          try {
            apiRef.current?.dispose();
          } catch {}
          apiRef.current = null;
        };
      } catch {
        navigate(-1);
      }
    })();

    return () => {
      if (cleanup) cleanup();
    };
  }, [lessonId, user, navigate]);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="h-14 bg-gray-800 text-white flex items-center justify-between px-4">
        <div className="font-semibold">Видеоурок</div>
        <button onClick={() => navigate(-1)} className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">Выйти</button>
      </div>
      <div className="h-[calc(100vh-56px)]" ref={containerRef} />
    </div>
  );
};

export default VideoRoom;


