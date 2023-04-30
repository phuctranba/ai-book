import { mhs } from "helpers/system.helper";

interface Shadow {
  shadowColor: string,
  shadowOffset: {
    width: number,
    height: number,
  },
  shadowOpacity: number,
  shadowRadius: number,

  elevation: number,
}

export const Shadow7: Shadow = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: mhs(4, 1),
  },
  shadowOpacity: 0.30,
  shadowRadius: mhs(4.65, 1),

  elevation: 7,
};

export const Shadow5: Shadow = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: mhs(3, 1),
  },
  shadowOpacity: 0.25,
  shadowRadius: mhs(3.65, 1),

  elevation: 5,
};

export const Shadow3: Shadow = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: mhs(2, 1),
  },
  shadowOpacity: 0.2,
  shadowRadius: mhs(2.22, 1),

  elevation: 3,
};

export const Shadow2: Shadow = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: mhs(2, 1),
  },
  shadowOpacity: 0.4,
  shadowRadius: mhs(1.41, 1),

  elevation: 2,
};

export const Shadow1: Shadow = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: mhs(1, 1),
  },
  shadowOpacity: 0.1,
  shadowRadius: mhs(0.7, 1),

  elevation: 1,
};

export const Shadow0: Shadow = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 0,
  },
  shadowOpacity: 0,
  shadowRadius: 0,

  elevation: 0,
};
