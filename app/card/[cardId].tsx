
import CardPreview from "@/feature/decks/deck-create-card/screens/CardPreview";

/**
 * Просмотр/редактирование карточки (v2.0.0).
 * Тот же конструктор, что и создание карточки, но в режиме редактирования:
 * карточка загружается в черновик, сохранение — через PUT /cards/{id}.
 * Маршрут: /card/[cardId]?deckId=[deckId]
 */
export default function CardView() {
  return <CardPreview />;
}
