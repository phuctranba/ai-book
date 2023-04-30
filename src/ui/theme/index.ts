export enum RootColor {
  Transparent = "#00000000",
  DarkBackground = "#212121",
  LightBackground = "#F5F5F5",
  MainColor = "#46B18F",
  PremiumColor = "#daa42f",
  TextToSpeech = "#46B18F",
  DarkText = "#F3F3F3",
  LightText = "#474747",
  RedNegative="#D44333",
  Blue = "#3498db",
  SpanishGray = "#8F8F8F",
  Smoke = "#D9D9D9",
  WhiteSmoke = "#E8E8E8"
}


export type SystemTheme = {
  backgroundMain: RootColor;
  background: RootColor;
  text: RootColor;
  textMain: RootColor;
  textLight: RootColor;
  textDark: RootColor;
  textError: RootColor;
  textInactive: RootColor;
  backgroundTextInput: RootColor;

  btnNegative:RootColor;
  btnActive:RootColor;
  btnInactive:RootColor;
  btnLight:RootColor;
  btnLightSmoke:RootColor;

  icon:RootColor;
  iconActive:RootColor;
  iconInactive:RootColor;
  iconLight:RootColor;
  iconDark:RootColor;

  gradient1: string
  gradient2: string
}
