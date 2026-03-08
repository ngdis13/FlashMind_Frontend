// app/(tabs)/_layout.js
import { Tabs } from "expo-router";
import React from "react";
import { ProfileIcon } from "@/assets/icons/IconsTabBar/ProfileIcon";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: 60,
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
        },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="decks" 
        options={{
          title: "Колоды",
          tabBarIcon: ({ color, focused }) => (
            <ProfileIcon 
              color={color}
              width={focused ? 26 : 22}
              height={focused ? 26 : 22}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile" 
        options={{
          title: "Колоды",
          tabBarIcon: ({ color, focused }) => (
            <ProfileIcon 
              color={color}
              width={focused ? 26 : 22}
              height={focused ? 26 : 22}
            />
          ),
        }}
      />
      

      <Tabs.Screen
        name="statistics" 
        options={{
          title: "Статистика",
          tabBarIcon: ({ color, focused }) => (
            <ProfileIcon 
              color={color}
              width={focused ? 26 : 22}
              height={focused ? 26 : 22}
            />
          ),
        }}
      />
    </Tabs>
  );
}