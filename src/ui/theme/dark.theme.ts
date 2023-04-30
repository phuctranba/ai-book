import {RootColor, SystemTheme} from "./index";

/**
 * Colors containing for dark theme
 */
const DarkTheme: SystemTheme = {
  backgroundMain: RootColor.MainColor,
  background: RootColor.DarkBackground,
  text: RootColor.DarkText,
  textMain: RootColor.MainColor,
  textLight: RootColor.DarkText,
  textDark: RootColor.LightText,
  textError: RootColor.RedNegative,
  textInactive: RootColor.SpanishGray,

  backgroundTextInput: RootColor.WhiteSmoke,

  btnNegative: RootColor.RedNegative,
  btnActive: RootColor.MainColor,
  btnInactive: RootColor.SpanishGray,
  btnLight: RootColor.LightBackground,
  btnLightSmoke:RootColor.Smoke,

  icon: RootColor.LightText,
  iconActive: RootColor.MainColor,
  iconInactive: RootColor.SpanishGray,
  iconLight: RootColor.DarkText,
  iconDark: RootColor.LightText,

  gradient1: "rgb(243, 115, 152)",
  gradient2: "rgb(224, 219, 70)"
};

export default DarkTheme;
