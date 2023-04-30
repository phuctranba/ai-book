import { IconClose } from 'assets/svgIcons'
import TextBase from 'components/TextBase'
import TextInputBase from 'components/TextInputBase'
import { countryCode } from 'constants/country.constant'
import { HIT_SLOP_EXPAND_10 } from 'constants/system.constant'
import { removeVietnameseTones } from 'helpers/string.helper'
import { useSystem } from 'helpers/system.helper'
import debounce from "lodash.debounce"
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HS, MHS, VS } from 'ui/sizes.ui'
import { SystemTheme } from 'ui/theme'

interface State {
  visible: boolean
  filter?: string
  filterFocus?: boolean
  renderFlagButton?: ({ onOpen }) => ReactNode
}

export const CountryPicker = (props) => {
  const { styles, theme } = useSystem(createStyles)
  const {
    modalProps,
    onClose: handleClose,
    onOpen: handleOpen,
    renderFlagButton,
    onSelect
  } = props
  const [state, setState] = useState<State>({
    visible: props.visible || false,
  })
  const { visible } = state
  const [list, setList] = useState(countryCode)
  const textSearch = useRef("")
  const safeArea = useSafeAreaInsets()

  useEffect(() => {
    if (state.visible !== props.visible) {
      setState({ ...state, visible: props.visible || false })
    }
  }, [props.visible])

  const onSearch = () => {
    const display_name = (i) => removeVietnameseTones(i).toLowerCase();
    const text = removeVietnameseTones(textSearch.current.trim()).toLowerCase();
    setList(countryCode.filter(i => display_name(`${i.name} (${i.dial_code})`).includes(text)));
  }

  const onSearchDebounce = debounce(onSearch, 300)

  const onOpen = () => {
    setState({ ...state, visible: true })
    if (handleOpen) {
      handleOpen()
    }
  }

  const onClose = () => {
    textSearch.current = ""
    setList(countryCode)
    setState({ ...state, visible: false })
    if (handleClose) {
      handleClose()
    }
  }

  const onSelectItem = (item) => {
    onSelect(item)
    onClose()
  }

  const renderItem = ({ item }) => {
    return (
      <Pressable style={styles.item} onPress={() => onSelectItem(item)}>
        <TextBase title={`${item.flag} ${item.name} (${item.dial_code})`} fontSize={16} color={theme.textDark} />
      </Pressable>
    )
  }

  return (
    <>
      {renderFlagButton({ onOpen })}
      <Modal
        {...{ visible, ...modalProps }}
        onRequestClose={onClose}
        onDismiss={onClose}
        animationType="slide"
      >
        <View style={[styles.viewFilter, { paddingTop: safeArea.top }]}>
          <Pressable onPress={onClose} hitSlop={HIT_SLOP_EXPAND_10}>
            <IconClose size={MHS._16} color={theme.textDark} />
          </Pressable>

          <TextInputBase
            placeholder="Select Country"
            style={styles.textInput}
            placeholderTextColor={theme.textInactive}
            onChangeText={(v) => {
              textSearch.current = v
              onSearchDebounce()
            }}
            onEndEditing={onSearchDebounce}
            onSubmitEditing={onSearchDebounce}
          />
        </View>

        <FlatList
          data={list}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: VS._20 }}
        />
      </Modal>
    </>
  )
}

const createStyles = (theme: SystemTheme) => {
  return StyleSheet.create({
    item: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.btnLightSmoke,
      paddingHorizontal: HS._16,
      paddingVertical: VS._12
    },
    viewFilter: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: HS._16
    },
    textInput: {
      flex: 1,
      paddingHorizontal: HS._16,
      fontSize: MHS._18
    }
  })
}