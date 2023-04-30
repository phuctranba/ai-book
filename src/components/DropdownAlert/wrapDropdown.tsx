import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import DropdownAlertView, {
  DropdownAlertType,
  DropdownAlertViewProps,
} from './dropdownAlert';

function WrapDropdownAlertView(props: DropdownAlertViewProps, ref: React.Ref<DropdownAlertType>) {
  const [dataMessage, setDataMessage] = useState<DropdownAlertViewProps>();
  const _queue = useRef<DropdownAlertViewProps[]>([]);
  const dropDownRef = useRef<any>();

  useImperativeHandle(ref, () => ({
    show: (content: DropdownAlertViewProps) => {
      if (content && (content.title != null || content.message != null)) {
        setDataMessage(content);
        dropDownRef.current.show();
      }
    },
    hide: () => {
      dropDownRef.current.hide();
    },
  }));

  const onHideDropdown = useCallback(() => {
    setDataMessage({})
  }, []);

  return (
    <DropdownAlertView
      {...props}
      {...dataMessage}
      onHide={onHideDropdown}
      ref={dropDownRef}
    />
  );
}

export default React.memo(forwardRef(WrapDropdownAlertView));