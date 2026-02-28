import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { StyleSheet } from "react-native";

export default function TabBar({state, descriptors, navigation}){
return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        // Получаем описание текущего экрана (например, title, tabBarIcon)
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || route.name;
        const iconName = options.tabBarIcon || 'home'; // Укажем дефолтную иконку

        const isFocused = state.index === index;

        // Определяем, нужно ли выделить текущую вкладку
        const handlePress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            // Если вкладка не активна, переходим на неё
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity key={route.key} style={styles.tabItem} onPress={handlePress}>
            <Text style={[styles.tabLabel, { color: isFocused ? '#673ab7' : '#222' }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  tabItem: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});