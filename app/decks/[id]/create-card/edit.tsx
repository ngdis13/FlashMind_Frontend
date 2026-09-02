import CreateCard from "@/feature/decks/deck-create-card/screens/CreateCard";

/**
 * Редактирование существующей карточки (v2.0.0).
 * Тот же конструктор, что и при создании, но в режиме редактирования:
 * наличие cardId в параметрах включает isEditMode, сохранение — PUT /cards/{id}.
 * Маршрут: /decks/[id]/create-card/edit?cardId=[cardId]
 */
export default function EditCard() {
  return <CreateCard />;
}
