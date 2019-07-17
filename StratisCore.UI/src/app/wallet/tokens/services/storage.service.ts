import { Injectable } from '@angular/core';

import { Log } from './logger.service';


@Injectable()
export class StorageService {

  getText(key: string): string {
    const serialisedItemData = localStorage.getItem(key);
    return serialisedItemData;
  }

  getNumber(key: string): number | undefined {
    const serialisedItemData = localStorage.getItem(key);
    if (isNaN(+serialisedItemData)) {
      return undefined;
    }
    return +serialisedItemData;
  }

  getItem<T>(key: string): T | undefined {
    const serialisedItemData = localStorage.getItem(key);
    if (!serialisedItemData) {
      return undefined;
    }

    try {
      const item = JSON.parse(serialisedItemData);
      return <T>item;
    } catch (e) {
      Log.error(e);
      return undefined;
    }
  }

  setItem<T>(key: string, value: T) {
    if (!value) {
      localStorage.setItem(key, null);
      return;
    }

    localStorage.setItem(key, JSON.stringify(value));
  }

  setText(key: string, value: string) {
    if (!!value) {
      localStorage.setItem(key, null);
      return;
    }

    localStorage.setItem(key, value);
  }

  setNumber(key: string, value: number) {
    if (!!value) {
      localStorage.setItem(key, null);
      return;
    }

    localStorage.setItem(key, value + '');
  }
}
