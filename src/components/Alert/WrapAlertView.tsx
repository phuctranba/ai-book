import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import isEqual from 'react-fast-compare';

import AlertView, {
  AlertViewProps,
  TypedAlert
} from './AlertView';



const WrapAlertView = (props: AlertViewProps, ref: React.Ref<TypedAlert>) => {
  const [alertsContent, setAlertsContent] = useState<any[]>([]);
  const alertRef = useRef<any>({});
  const alertCount = useRef(0);
  const currentZIndex = useRef<any>(undefined);

  const setVisible = useCallback((value, id) => {
    if (value) {
      setAlertsContent((currentAlerts: any[]) => currentAlerts.map((alert: any) => (alert.id === id ? { ...alert, visible: value } : alert)));
    }
  }, []);

  useEffect(() => {
    if (Array.isArray(alertsContent) && alertsContent.length === 0) {
      currentZIndex.current = undefined;
    }
  }, [alertsContent]);

  useImperativeHandle(ref, () => ({
    alert: (content: AlertViewProps) => {
      alertCount.current++;
      const id = alertCount.current;
      if (content && content.zIndex !== undefined) {
        currentZIndex.current = content.zIndex;
      }
      setAlertsContent(currentAlerts => currentAlerts.concat({
        ...content,
        id,
        visible: true,
        zIndex: currentZIndex.current,
        setVisible: (value: boolean) => setVisible(value, id),
        onClose: () => {
          content && content.onClose && content.onClose();
          setAlertsContent(alertsState => alertsState.filter(alert => alert.id !== id));
          alertCount.current--;
        },
      }));
    },
    close: () => {
      alertRef.current[alertCount.current] && alertRef.current[alertCount.current].close();
    },
    closeAll: () => {
      Object.keys(alertRef.current).forEach(alertKey => {
        alertRef.current[alertKey] && alertRef.current[alertKey].close();
      });
    },
  }), [alertCount.current]);

  return (
    <>
      {
        alertsContent.map((alert, idx) => {
          return (
            <AlertView
              {...props}
              {...alert}
              nativeModal={false}
              key={`${alert.id}_${idx}`}
              ref={refs => { alertRef.current[alert.id] = refs; }}
            />
          );
        })
      }
    </>
  )

}

export default React.memo(forwardRef(WrapAlertView), isEqual);