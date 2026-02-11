import { useEffect, useRef } from "react";

/**
 * Кастомный хук для работы с интервалом. Управляет запуском функции через заданный промежуток времени.
 * Хук предотвращает утечки памяти, обновляя сохраненную ссылку на callback, если он изменяется, и очищая интервал при размонтировании компонента.
 * 
 * @param callback - Функция, которая будет вызываться через заданный интервал
 * @param delay - Задержка (в миллисекундах) между вызовами callback, или null для остановки интервала
 * 
 * @example
 * const MyComponent = () => {
 *   const [count, setCount] = useState(0);
 *
 *   useInterval(() => {
 *     setCount((prev) => prev + 1);
 *   }, 1000); // Увеличивает count каждую секунду
 *   
 *   return <div>{count}</div>;
 * }
 */
export function useInterval(callback: () => void, delay: number | null) {
    // Ссылка на callback для предотвращения его пересоздания на каждом рендере
    const savedCallback = useRef(callback);

    // Обновляем сохраненную версию callback каждый раз, когда он изменяется
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    // Настройка интервала
    useEffect(() => {
      if (delay === null) return; // Если задержка равна null, прекращаем интервал

      // Создаем новый интервал, который вызывает сохраненный callback через заданный delay
      const id = setInterval(() => savedCallback.current(), delay);

      // Очищаем интервал при размонтировании компонента или изменении delay
      return () => clearInterval(id);
    }, [delay]); // Перезапускать хук при изменении задержки
}
