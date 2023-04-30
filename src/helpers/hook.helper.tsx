import React, {useCallback, useEffect, useState} from "react";
import {RefreshControl} from "react-native";
import {RootColor} from "ui/theme";

interface TypedUseListData<T> {
  listData: T[];
  nextPage: number;
  isLastPage: boolean;
  isFirstLoading: boolean;
  refreshing: boolean;
  onEndReach: (info?: { distanceFromEnd: number }) => void;
  refreshControl: () => JSX.Element;
  refreshListPage: Function;
  setListData: (newListData:T[]) => void;
}

interface TypedStateListData<T> {
  listData: T[];
  nextPage: number;
  isFirstLoading: boolean;
  isLastPage: boolean;
  refreshing: boolean;
}

export function useListData<T>(isConnected: boolean, limitPerPage: number, requestData: (page: number, limit: number) => Promise<T[]>, initData: T[] = []): TypedUseListData<T> {
  const [stateListData, setStateListData] = useState<TypedStateListData<T>>({
    listData: initData,
    nextPage: initData.length > 0 ? 2 : 1,
    isFirstLoading: initData.length <= 0,
    isLastPage: false,
    refreshing: false
  })

  useEffect(() => {
    if (initData.length === 0) {
      refreshListPage();
    }
  }, [isConnected])

  const refreshListPage = async () => {
    if (initData.length === 0)
      setStateListData(oldState => ({...oldState, refreshing: true}))

    await requestData(1, limitPerPage)
      .then((newData) => {
        let isLastPage = false;
        let nextPage = 1;
        if (newData.length < limitPerPage) {
          isLastPage = true;
        } else {
          nextPage = 2;
        }

        setStateListData(oldState => ({
          ...oldState,
          isLastPage,
          nextPage,
          listData: newData,
          isFirstLoading: false,
          refreshing: false
        }))
      })
      .catch(() => {
        let isLastPage = false;
        let nextPage = 1;

        setStateListData(oldState => ({
          ...oldState,
          isLastPage,
          nextPage,
          listData: [],
          isFirstLoading: false,
          refreshing: false
        }))
      });

  }

  async function onEndReach() {
    if (!stateListData.isLastPage) {
      await requestData(stateListData.nextPage, limitPerPage)
        .then((newData) => {
          let isLastPage = false;
          let nextPage = stateListData.nextPage;

          if (newData.length < limitPerPage) {
            isLastPage = true;
          } else {
            nextPage = stateListData.nextPage + 1;
          }

          setStateListData(oldState => ({
            ...oldState,
            isLastPage,
            nextPage,
            listData: [...stateListData.listData, ...newData],
            refreshing: false
          }))
        })
        .catch(() => {
          setStateListData(oldState => ({
            ...oldState,
            refreshing: false
          }))
        })
    }
  }

  const setListData = useCallback((newListData: T[]) => {
    setStateListData(oldState => ({
      ...oldState,
      listData: newListData
    }))
  }, [])

  function refreshControl() {
    return <RefreshControl onRefresh={refreshListPage}
                           refreshing={stateListData.refreshing}
                           tintColor={RootColor.MainColor}
                           colors={[RootColor.MainColor]}/>
  }

  return {
    listData: stateListData.listData,
    nextPage: stateListData.nextPage,
    isLastPage: stateListData.isLastPage,
    refreshing: stateListData.refreshing,
    onEndReach,
    refreshControl,
    refreshListPage,
    isFirstLoading: stateListData.isFirstLoading,
    setListData
  };
}

interface TypedUseListDataWithoutPage<T> {
  listData: T[];
  lastItem: T | undefined;
  isLastPage: boolean;
  isFirstLoading: boolean;
  refreshing: boolean;
  onEndReach: (info: { distanceFromEnd: number }) => void;
  refreshControl: () => JSX.Element;
  refreshListPage: Function;
  setListData: (newListData:T[]) => void;
}

interface TypedStateListDataWithoutPage<T> {
  listData: T[];
  lastItem?: T | undefined,
  isFirstLoading: boolean;
  isLastPage: boolean;
  refreshing: boolean;
}

export function useListDataWithoutPage<T>(isConnected: boolean, limitPerRequest: number, requestData: (limit: number, lastItem?: T) => Promise<T[]>, initData: T[] = []): TypedUseListDataWithoutPage<T> {
  const [stateListData, setStateListData] = useState<TypedStateListDataWithoutPage<T>>({
    listData: initData,
    lastItem: initData.length > 0 ? initData[initData.length - 1] : undefined,
    isFirstLoading: initData.length <= 0,
    isLastPage: false,
    refreshing: false
  })

  useEffect(() => {
    if (initData.length === 0) {
      refreshListPage();
    }
  }, [isConnected])

  const refreshListPage = async () => {
    if (initData.length === 0)
      setStateListData(oldState => ({...oldState, refreshing: true}))

    await requestData(limitPerRequest)
      .then((newData) => {
        let isLastPage = false;
        let lastItem;
        if (newData.length < limitPerRequest) {
          isLastPage = true;
        } else {
          lastItem = newData[newData.length - 1];
        }

        setStateListData(oldState => ({
          ...oldState,
          isLastPage,
          lastItem,
          listData: newData,
          isFirstLoading: false,
          refreshing: false
        }))
      })
      .catch(() => {
        let isLastPage = false;
        let lastItem = undefined;

        setStateListData(oldState => ({
          ...oldState,
          isLastPage,
          lastItem,
          listData: [],
          isFirstLoading: false,
          refreshing: false
        }))
      });
  }

  const setListData = useCallback((newListData: T[]) => {
    setStateListData(oldState => ({
      ...oldState,
      listData: newListData
    }))
  }, [])

  async function onEndReach() {
    if (!stateListData.isLastPage) {
      await requestData(limitPerRequest, stateListData.lastItem)
        .then((newData) => {
          let isLastPage = false;
          let lastItem = stateListData.lastItem;

          if (newData.length < limitPerRequest) {
            isLastPage = true;
          } else {
            lastItem = newData[newData.length - 1];
          }

          setStateListData(oldState => ({
            ...oldState,
            isLastPage,
            lastItem,
            listData: [...stateListData.listData, ...newData],
            refreshing: false
          }))
        })
        .catch(() => {
          setStateListData(oldState => ({
            ...oldState,
            refreshing: false
          }))
        })
    }
  }

  function refreshControl() {
    return <RefreshControl onRefresh={refreshListPage}
                           refreshing={stateListData.refreshing}
                           tintColor={RootColor.MainColor}
                           colors={[RootColor.MainColor]}/>
  }

  return {
    listData: stateListData.listData,
    lastItem: stateListData.lastItem,
    isLastPage: stateListData.isLastPage,
    refreshing: stateListData.refreshing,
    onEndReach,
    refreshControl,
    refreshListPage,
    isFirstLoading: stateListData.isFirstLoading,
    setListData
  };
}
