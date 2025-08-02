import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import SortableItem from './SortableItem';

function SortableItemsList({ 
  items, 
  templateFields, 
  onLike, 
  onReorder 
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Mejorar la activación para evitar conflictos con scroll
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      // Configuración optimizada para móviles - evitar conflicto con scroll
      activationConstraint: {
        delay: 100, // Menos delay para mejor respuesta
        tolerance: 3, // Menos tolerancia = más sensible
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    console.log('🎯 Drag started:', event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    console.log('🎯 Drag ended:', active.id, '->', over?.id);

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems.map(item => item.id));
    }
  };

  // Encontrar el item con más likes (si hay empate, el primero cronológicamente)
  const maxLikes = Math.max(...items.map(item => item.likes_count));
  const mostLikedItem = maxLikes > 0 ? items.find(item => item.likes_count === maxLikes) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
    >
      <SortableContext 
        items={items.map(item => item.id)} 
        strategy={verticalListSortingStrategy}
      >
        {items.map((item, index) => {
          // Añadir clase de animación para items recién creados
          const isNew = Date.now() - new Date(item.created_at).getTime() < 1000;
          
          return (
            <SortableItem
              key={item.id}
              id={item.id}
              item={item}
              index={index}
              templateFields={templateFields}
              onLike={onLike}
              showGoldBorder={mostLikedItem && item.id === mostLikedItem.id}
              className={isNew ? 'animate-in' : ''}
            />
          );
        })}
      </SortableContext>
    </DndContext>
  );
}

export default SortableItemsList;
