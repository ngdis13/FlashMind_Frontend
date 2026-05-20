//Основные рабочие импорты
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { View } from "react-native";

//Стили
import { styles } from "../styles/ThirdStep.styles";
import { Typography } from "@/styles/Typography";
import { commonStyles } from "@/styles/Common";

//Иконки
import { LogoHappyStar } from "@/components/LogoHappyStar";

//Дополнительные компоненты
import { ProgressLineAnimated } from "@/components/ProgressLine";
import { MainButton } from "@/components/MainButton";
import { Input } from "@/components/Input";

//Дополнительные функции
import { validateNameField } from "../../auth/validators/user-name.validator";
import { useUserStore } from "@/store/userStore";

/**
 * Третий шаг онбординга.
 *
 * Экран позволяет пользователю ввести имя и фамилию.
 * Эти данные используются для дальнейшей персонализации.
 */
export default function ThirdStepScreen() {
  const router = useRouter();

  const { user, updateProfile } = useUserStore();

  const [name, setName] = useState("");
  const [lastname, setLastName] = useState("");
  const [errors, setErrors] = useState<{
    name: string | null;
    lastname: string | null;
  }>({
    name: null,
    lastname: null,
  });

  const isButtonActive =
    name.trim() !== "" &&
    lastname.trim() !== "" &&
    !errors.name &&
    !errors.lastname;

  /**
   * Обрабатывает нажатие кнопки, выполняя валидацию полей.
   */
  const handlePress = () => {
    const newErrors = {
      name: validateNameField(name, "Имя"),
      lastname: validateNameField(lastname, "Фамилия"),
    };

    setErrors(newErrors);

    if (newErrors.name || newErrors.lastname) {
      return;
    }

    updateProfile({ firstName: name, lastName: lastname });
    router.push("/onboarding/fourth-step");
  };

  return (
    <View style={commonStyles.viewContainer}>
      <View style={commonStyles.container}>
        <View style={styles.container}>
          
          {/* Индикатор прогресса */}
          <View style={styles.progressLineBox}>
            <ProgressLineAnimated currentStep={3} />
          </View>

          {/* Центральный контент */}
          <View style={styles.content}>
            <LogoHappyStar size={160} style={{ marginBottom: 12 }} />

            <Typography variant="h1" style={styles.typography}>
              Как нам к тебе обращаться?
            </Typography>

            <View style={styles.inputContainer}>
              {/* Поле Имени */}
              <View style={styles.field}>
                <Input
                  style={[
                    styles.input,
                    errors.name ? styles.inputError : undefined,
                  ]}
                  placeholder="Имя"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) {
                      setErrors((prev) => ({ ...prev, name: null }));
                    }
                  }}
                  autoCapitalize="none"
                />
                {errors.name && (
                  <Typography variant="h3" style={styles.errorText}>
                    {errors.name}
                  </Typography>
                )}
              </View>

              {/* Поле Фамилии */}
              <View style={styles.field}>
                <Input
                  style={[
                    styles.input,
                    errors.lastname ? styles.inputError : undefined,
                  ]}
                  placeholder="Фамилия"
                  value={lastname}
                  onChangeText={(text) => {
                    setLastName(text);
                    if (errors.lastname) {
                      setErrors((prev) => ({ ...prev, lastname: null }));
                    }
                  }}
                  autoCapitalize="none"
                />
                {errors.lastname && (
                  <Typography variant="h3" style={styles.errorText}>
                    {errors.lastname}
                  </Typography>
                )}
              </View>
            </View>
          </View>

          {/* Кнопка действия */}
          <View style={styles.buttonContainer}>
            <MainButton
              title="Дальше"
              onPress={handlePress}
              disabled={!isButtonActive}
            />
          </View>

        </View>
      </View>
    </View>
  );
}
