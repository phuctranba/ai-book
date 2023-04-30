import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import ActionSheetView, {
  ActionSheetType,
  ActionSheetViewProps,
} from './ActionSheetView';

function WrapActionSheetView(props: ActionSheetViewProps, ref: React.Ref<ActionSheetType>) {
  const [actionSheetsContent, setActionSheetsContent] = useState<any[]>([]);
  const actionSheetRef = useRef<any>({});
  const actionSheetCount = useRef(0);
  const currentZIndex = useRef<any>(undefined);

  const setVisible = useCallback((value, id) => {
    if (value) {
      setActionSheetsContent((currentActionSheets: any) => currentActionSheets.map((actionSheet: any) => (actionSheet.id === id ? { ...actionSheet, visible: value } : actionSheet)));
    }
  }, []);

  useEffect(() => {
    if (Array.isArray(actionSheetsContent) && actionSheetsContent.length === 0) {
      currentZIndex.current = undefined;
    }
  }, [actionSheetsContent]);

  useImperativeHandle(ref, () => ({
    show: (content: ActionSheetViewProps) => {
      actionSheetCount.current++;
      const id = actionSheetCount.current;
      if (content && content.zIndex !== undefined) {
        currentZIndex.current = content.zIndex;
      }
      setActionSheetsContent(currentActionSheets => currentActionSheets.concat({
        ...content,
        id,
        visible: true,
        zIndex: currentZIndex.current,
        setVisible: (value: boolean) => setVisible(value, id),
        onHide: () => {
          content && content.onHide && content.onHide();
          setActionSheetsContent(actionSheetsState => actionSheetsState.filter(actionSheet => actionSheet.id !== id));
          actionSheetCount.current--;
        },
      }));
    },
    hide: () => {
      actionSheetRef.current[actionSheetCount.current] && actionSheetRef.current[actionSheetCount.current].hide();
    },
    hideAll: () => {
      Object.keys(actionSheetRef.current).forEach(dataKey => {
        actionSheetRef.current[dataKey] && actionSheetRef.current[dataKey].hide();
      });
    },
  }), [actionSheetCount.current]);

  return (
    <>
      {
        actionSheetsContent.map((actionSheet, idx) => {
          return (
            <ActionSheetView
              {...props}
              {...actionSheet}
              nativeModal={false}
              key={`${actionSheet.id}_${idx}`}
              ref={refs => { actionSheetRef.current[actionSheet.id] = refs; }}
            />
          );
        })
      }
    </>
  )
}

export default React.memo(forwardRef(WrapActionSheetView));