let draggingElement = null;
let dropTarget = null;
let isDraggingGroup = false;

function setupDragAndDrop(element) {
    element.addEventListener('dragstart', dragStart);
    element.addEventListener('dragend', dragEnd);
}

function dragStart(e) {
    draggingElement = e.target.closest('.draggable');
    isDraggingGroup = draggingElement.classList.contains('card');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
    setTimeout(() => draggingElement.classList.add('dragging'), 0);
}

function dragEnd(e) {
    if (draggingElement && dropTarget) {
        if (isDraggingGroup) {
            rearrangeGroups();
        } else {
            rearrangeFields();
        }
    }
    
    if (draggingElement) {
        draggingElement.classList.remove('dragging');
    }
    draggingElement = null;
    dropTarget = null;
    isDraggingGroup = false;
    clearDragOverStyles();
}

function rearrangeGroups() {
    const rect = dropTarget.getBoundingClientRect();
    const dropY = rect.top + rect.height / 2;
    if (event.clientY < dropY) {
        groupsContainer.insertBefore(draggingElement, dropTarget);
    } else {
        groupsContainer.insertBefore(draggingElement, dropTarget.nextElementSibling);
    }
}

function rearrangeFields() {
    const sourceTable = draggingElement.closest('tbody');
    const targetTable = dropTarget.closest('tbody');
    
    if (sourceTable !== targetTable) {
        targetTable.insertBefore(draggingElement, dropTarget);
    } else {
        const rect = dropTarget.getBoundingClientRect();
        const dropY = rect.top + rect.height / 2;
        if (event.clientY < dropY) {
            sourceTable.insertBefore(draggingElement, dropTarget);
        } else {
            sourceTable.insertBefore(draggingElement, dropTarget.nextElementSibling);
        }
    }
}

function clearDragOverStyles() {
    document.querySelectorAll('.drag-over-group, .drag-over-field').forEach(el => {
        el.classList.remove('drag-over-group', 'drag-over-field');
    });
}

function getClosestDraggableElement(clientY) {
    const draggableElements = [...document.querySelectorAll('.draggable:not(.dragging)')];
    return draggableElements.reduce((closest, element) => {
        // Only consider groups when dragging a group, and fields when dragging a field
        if ((isDraggingGroup && !element.classList.contains('card')) ||
            (!isDraggingGroup && element.classList.contains('card'))) {
            return closest;
        }

        const box = element.getBoundingClientRect();
        const offset = clientY - box.top - box.height / 2;
        if (Math.abs(offset) < Math.abs(closest.offset)) {
            return { offset: offset, element: element };
        } else {
            return closest;
        }
    }, { offset: Number.POSITIVE_INFINITY }).element;
}

document.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!draggingElement) return;

    dropTarget = getClosestDraggableElement(e.clientY);
    
    if (dropTarget) {
        clearDragOverStyles();
        if (isDraggingGroup && dropTarget.classList.contains('card')) {
            dropTarget.classList.add('drag-over-group');
        } else if (!isDraggingGroup && dropTarget.closest('tr')) {
            dropTarget.classList.add('drag-over-field');
        }
    }
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    dragEnd(e);
});