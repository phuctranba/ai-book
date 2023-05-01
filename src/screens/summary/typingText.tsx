import TextBase from 'components/TextBase';
import React, { forwardRef, memo, useImperativeHandle, useRef, useState, useEffect } from 'react';

interface Props {
	addMessageToList?: () => void
	speed: number
}

const TypingText = forwardRef(({ addMessageToList, speed }: Props, ref) => {
	const [config, setConfig] = useState({
		index: 0,
		text: ""
	})
	const textMessageProps = useRef("")
	const isDone = useRef(false)
	const timeout = useRef<NodeJS.Timer>()

	const duration = (5 - speed) * 10

	useEffect(() => {
		if (config.index == 0) {
			return;
		}
		handleIndexIncrement()
	}, [config.index])

	const handleIndexIncrement = () => {
		if (isDone.current && config.index >= (textMessageProps.current.length - 1)) {
			setConfig(prev => ({
				...prev,
				text: textMessageProps.current
			}))
			addMessageToList?.();
			return;
		}
		timeout.current = setTimeout(() => {
			setConfig(prev => ({
				index: prev.index + 1,
				text: textMessageProps.current.slice(0, config.index)
			}))
		}, duration);
	}

	useImperativeHandle(ref, () => ({
		setDone: () => {
			isDone.current = true
		},
		setText: (text: string) => {
			textMessageProps.current = text
			if (config.index == 0) {
				setConfig({
					text: text?.[0] || "",
					index: 1
				})
			} else {
				setConfig(prev => ({ ...prev }))
			}
		},
		setFullText: (text: string) => {
			setConfig({
				text: text,
				index: 0
			})
		},
		resetText: () => {
			textMessageProps.current = ""
			if (timeout.current) {
				clearTimeout(timeout.current)
			}
			setConfig({
				index: 0,
				text: ""
			})
		}
	}), [config.index]);

	return (
		<TextBase
			style={{textAlign:'justify'}}
			title={config.text}
		/>
	);
})


export default memo(TypingText);
