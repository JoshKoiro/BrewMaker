/**
 * @module dragDrop
 * @description A module that handles the drag and drop functionality of the form.
 */

let draggingElement = null;
let dropTarget = null;
let isDraggingGroup = false;

/**
 * @func setupDragAndDrop Sets up the drag and drop functionality for the given element.
 * @param {HTMLElement} element The element to setup the drag and drop functionality for.
 * @returns {void} This function does not return anything.
 */
function setupDragAndDrop(element) {
    element.addEventListener('dragstart', dragStart);
    element.addEventListener('dragend', dragEnd);
}

/**
 * @func dragStart Handles the drag start event.
 * @param {HTMLElement} e The element that is being dragged.
 * @returns {void} This function does not return anything.
 */
function dragStart(e) {
    draggingElement = e.target.closest('.draggable');
    isDraggingGroup = draggingElement.classList.contains('card');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
    setTimeout(() => draggingElement.classList.add('dragging'), 0);
}

/**
 * @func dragEnd Handles the drag end event. This function determines the drop target and rearranges the groups or fields accordingly.
 * @param {HTMLElement} e The element that is being dragged.
 * @returns {void} This function does not return anything.
 */
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

/**
 * @func rearrangeGroups Rearranges the groups in the groups container. This function is called when a group is dragged over another group.
 * @returns {void} This function does not return anything.
 */
function rearrangeGroups() {
    const rect = dropTarget.getBoundingClientRect();
    const dropY = rect.top + rect.height / 2;
    if (event.clientY < dropY) {
        groupsContainer.insertBefore(draggingElement, dropTarget);
    } else {
        groupsContainer.insertBefore(draggingElement, dropTarget.nextElementSibling);
    }
}

/**
 * @func rearrangeFields Rearranges the fields in the groups container. This function is called when a field is dragged over another field.
 * @returns {void} This function does not return anything.
 */
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

/**
 * @func clearDragOverStyles Clears the drag over styles of the groups and fields. This function is called when the drag ends.
 * @returns {void} This function does not return anything.
 */
function clearDragOverStyles() {
    document.querySelectorAll('.drag-over-group, .drag-over-field').forEach(el => {
        el.classList.remove('drag-over-group', 'drag-over-field');
    });
}

/**
 * @func getClosestDraggableElement Returns the closest draggable element to the given clientY position.
 * @param {number} clientY The clientY position of the mouse cursor.
 * @returns {HTMLElement} The closest draggable element to the given clientY position.
 */
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

//** Drag and Drop Events */
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