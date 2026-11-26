export interface ColorPalette {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  primarySoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
}

export const lightColors: ColorPalette = {
  background: '#F7F9FB',
  surface: '#FFFFFF',
  surfaceElevated: '#F0F4F8',
  border: '#D8E1E8',
  text: '#102A43',
  textMuted: '#486581',
  primary: '#0F6275',
  primaryText: '#FFFFFF',
  primarySoft: '#E3F2F5',
  success: '#1E7A56',
  successSoft: '#E4F4ED',
  warning: '#9A5B13',
  warningSoft: '#FDF3E3',
  danger: '#B42318',
  dangerSoft: '#FDECEC',
  info: '#1D4ED8',
  infoSoft: '#EAF0FD',
};

export const darkColors: ColorPalette = {
  background: '#0B141C',
  surface: '#13202C',
  surfaceElevated: '#1A2B3A',
  border: '#2B4054',
  text: '#F0F4F8',
  textMuted: '#9FB3C8',
  primary: '#3FA7BC',
  primaryText: '#08131A',
  primarySoft: '#163542',
  success: '#4CC38A',
  successSoft: '#143225',
  warning: '#F0B44C',
  warningSoft: '#342712',
  danger: '#F97066',
  dangerSoft: '#3A1818',
  info: '#7AA2F7',
  infoSoft: '#182442',
};
