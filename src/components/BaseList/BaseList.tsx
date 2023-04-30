import React, {
  memo, useEffect, useRef
} from 'react';

import { useScrollToTop } from '@react-navigation/native';
import { useSystem } from "helpers/system.helper";
import isEqual from 'react-fast-compare';
import {
  ActivityIndicator,
  FlatList,
  FlatListProps,
  Platform,
  RefreshControl,
  StyleSheet,
  View
} from 'react-native';
import { VS } from 'ui/sizes.ui';

interface Props extends FlatListProps<any> {
  scrollIndex?: number,
  data: any[],
  onRefreshProp?: (() => void) | ( () => Promise<void>),
  isRefresh: boolean,
  onLoadMoreProp?: (() => void) | ( () => Promise<void>),
  isLoadMore?: boolean,
  tabLabel?: string,
}

const BaseList = (props: Props) => {
  const {
    scrollIndex,
    data,
    onRefreshProp = () => { },
    isRefresh,
    onLoadMoreProp = () => { },
    isLoadMore = false,
    style = {},
    keyExtractor,
    tabLabel,
    ...flatlistProps
  } = props;
  const onScroll = useRef(false);
  const { theme } = useSystem();
  const flatlistRef = useRef<FlatList>(null)


  useScrollToTop(flatlistRef)

  useEffect(()=>{
    onRefresh()
  },[])

  const onRefresh = () => {
    onRefreshProp?.();
  };

  const renderFooterComponent = () => {
    return isLoadMore ? (
      <View style={styles.footerLoading}>
        <ActivityIndicator color={theme.backgroundMain} size={20} />
      </View>
    ) : (
      <View style={styles.footer} />
    )
  };

  const handleLoadMore = () => {
    if (!isLoadMore && onScroll.current) {
      onLoadMoreProp?.();
    }
    onScroll.current = false;
  }

  return (
    <FlatList
      ref={flatlistRef}
      data={data}
      keyExtractor={(item, index) => keyExtractor ? `${keyExtractor} - ${index}` : `${item.id} - ${index}`}
      style={style}
      scrollEventThrottle={16}
      ListFooterComponent={props.ListFooterComponent || renderFooterComponent}
      extraData={data}
      onMomentumScrollBegin={() => { onScroll.current = true }}
      onScrollBeginDrag={() => { onScroll.current = true }}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={Platform.OS === "android" ? 0.5 : -0.001}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
      refreshControl={
        <RefreshControl refreshing={isRefresh} onRefresh={onRefresh} />
      }
      {...flatlistProps}
    />
  );
}

const styles = StyleSheet.create({
  footerLoading: {
    marginVertical: VS._10
  },
  footer: {
    height: VS._32
  }
})

export default memo(BaseList, isEqual);
