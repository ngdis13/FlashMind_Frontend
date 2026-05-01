// app/(tabs)/_layout.js
import { Tabs } from "expo-router";
import React from "react";
import { ProfileIcon } from "@/assets/icons/IconsTabBar/ProfileIcon";
import { CardsDeskIcon } from "@/assets/icons/IconsTabBar/CardsDeskIcon";
import { StatisticIcon } from "@/assets/icons/IconsTabBar/StatisticIcon";
import { colors } from "@/styles/Colors";
import { View } from "react-native";
import { commonStyles } from "@/styles/Common";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.mainColor,
        tabBarInactiveTintColor: colors.darkMainColor,
        tabBarShowLabel: false,
        tabBarStyle: {
          // 1. Позиционирование
          position: "absolute", // Делаем его плавающим над контентом
          bottom: 10, // Отступ от низа экрана
          left: 10, // Отступ слева
          right: 10, // Отступ справа

          // 2. Внешний вид
          backgroundColor: "#ffffff", // Цвет самого бара
          height: 60, // Высота бара
          borderRadius: 20, // Сильное закругление углов

          flexDirection: "row", // Располагаем элементы в ряд
          justifyContent: "center", // Центрируем группу элементов
          alignItems: "center", // Центрируем иконки по вертикали внутри бара
          paddingBottom: 0, // Убираем стандартный отступ для iPhone (важно!)
          borderTopWidth: 0, // Убираем серую полоску сверху

          // 4. Тень (чтобы он "парил")
          elevation: 5, // Для Android
          shadowColor: "#000", // Для iOS
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
      }}
    >
      <Tabs.Screen
        name="decks"
        options={{
          title: "Колоды",
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                commonStyles.tabIconBox,
                { backgroundColor: focused ? colors.mainColor : "#F1F1F1" },
              ]}
            >
              <CardsDeskIcon
                color={focused ? "#FFFFFF" : colors.darkMainColor}
                width={focused ? 26 : 22}
                height={focused ? 26 : 22}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="statistics/index"
        options={{
          title: "Статистика",
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                commonStyles.tabIconBox,
                { backgroundColor: focused ? colors.mainColor : "#F1F1F1" },
              ]}
            >
              <StatisticIcon
                color={focused ? "#FFFFFF" : colors.darkMainColor}
                width={focused ? 26 : 22}
                height={focused ? 26 : 22}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Профиль",
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                commonStyles.tabIconBox,
                { backgroundColor: focused ? colors.mainColor : "#F1F1F1" },
              ]}
            >
              <ProfileIcon
                color={focused ? "#FFFFFF" : colors.darkMainColor}
                width={focused ? 26 : 22}
                height={focused ? 26 : 22}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
