// Task Management Application
// Main JavaScript file

// Task class to represent a task
class Task {
    constructor(id, name, description = '', dueDate = '', completed = false) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.dueDate = dueDate;
        this.completed = completed;
        this.createdAt = new Date();
    }
}

// TaskManager class to handle all task operations
class TaskManager {
    constructor() {
        // Initialize tasks array from localStorage or empty array
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        
        // DOM Elements
        this.taskForm = document.getElementById('task-form');
        this.taskNameInput = document.getElementById('task-name');
        this.taskDescriptionInput = document.getElementById('task-description');
        this.dueDateInput = document.getElementById('due-date');
        this.saveTaskBtn = document.getElementById('save-task-btn');
        this.cancelEditBtn = document.getElementById('cancel-edit-btn');
        this.editTaskId = document.getElementById('edit-task-id');
        this.tasksListContainer = document.getElementById('tasks-list');
        this.statusFilter = document.getElementById('status-filter');
        this.searchInput = document.getElementById('search-input');
        this.formTitle = document.getElementById('form-title');
        this.notification = document.getElementById('notification');
        
        // Template for task items
        this.taskTemplate = document.getElementById('task-template');
        
        // Set today's date as the default for the date input
        const today = new Date();
        const formattedDate = today.toISOString().substr(0, 10);
        this.dueDateInput.value = formattedDate;
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Initial render of tasks
        this.renderTasks();
    }
    
    // Initialize all event listeners
    initEventListeners() {
        // Form submission for adding/editing tasks
        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTaskFormSubmit();
        });
        
        // Cancel edit button
        this.cancelEditBtn.addEventListener('click', () => {
            this.resetForm();
        });
        
        // Status filter change
        this.statusFilter.addEventListener('change', () => {
            this.currentFilter = this.statusFilter.value;
            this.renderTasks();
        });
        
       
        
        // Event delegation for task actions (complete, edit, delete)
        this.tasksListContainer.addEventListener('click', (e) => {
            const taskItem = e.target.closest('.task-item');
            
            if (!taskItem) return;
            
            const taskId = taskItem.dataset.id;
            
            // Handle checkbox click
            if (e.target.classList.contains('task-checkbox')) {
                this.toggleTaskStatus(taskId);
            }
            
            // Handle edit button click
            if (e.target.classList.contains('edit-btn')) {
                this.startEditTask(taskId);
            }
            
            // Handle delete button click
            if (e.target.classList.contains('delete-btn')) {
                this.deleteTask(taskId);
            }
        });
    }
    
    // Handle form submission for adding/editing tasks
    handleTaskFormSubmit() {
        const taskName = this.taskNameInput.value.trim();
        const taskDescription = this.taskDescriptionInput.value.trim();
        const dueDate = this.dueDateInput.value;
        
        // Validate task name
        if (!taskName) {
            this.showNotification('Task name is required!', 'error');
            return;
        }
        
        // Check if editing or adding new task
        if (this.editTaskId.value) {
            // Update existing task
            this.updateTask(
                this.editTaskId.value,
                taskName,
                taskDescription,
                dueDate
            );
            this.showNotification('Task updated successfully!', 'success');
        } else {
            // Add new task
            this.addTask(taskName, taskDescription, dueDate);
            this.showNotification('Task added successfully!', 'success');
        }
        
        // Reset form
        this.resetForm();
    }
    
    // Add a new task
    addTask(name, description, dueDate) {
        const newTask = new Task(
            Date.now().toString(), // unique ID using timestamp
            name,
            description,
            dueDate
        );
        
        this.tasks.push(newTask);
        this.saveTasks();
        this.renderTasks();
    }
    
    // Update an existing task
    updateTask(id, name, description, dueDate) {
        this.tasks = this.tasks.map(task => {
            if (task.id === id) {
                return {
                    ...task,
                    name,
                    description,
                    dueDate
                };
            }
            return task;
        });
        
        this.saveTasks();
        this.renderTasks();
    }
    
    // Delete a task
    deleteTask(id) {
        // Ask for confirmation
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.renderTasks();
            this.showNotification('Task deleted successfully!', 'success');
        }
    }
    
    // Toggle task status (completed/pending)
    toggleTaskStatus(id) {
        this.tasks = this.tasks.map(task => {
            if (task.id === id) {
                return {
                    ...task,
                    completed: !task.completed
                };
            }
            return task;
        });
        
        this.saveTasks();
        this.renderTasks();
        
        // Find the task to show a specific message
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            const status = task.completed ? 'completed' : 'pending';
            this.showNotification(`Task marked as ${status}!`, 'success');
        }
    }
    
    // Start editing a task
    startEditTask(id) {
        const task = this.tasks.find(task => task.id === id);
        
        if (!task) return;
        
        // Fill form with task data
        this.taskNameInput.value = task.name;
        this.taskDescriptionInput.value = task.description || '';
        this.dueDateInput.value = task.dueDate || '';
        this.editTaskId.value = task.id;
        
        // Change button text and show cancel button
        this.saveTaskBtn.textContent = 'Update Task';
        this.formTitle.textContent = 'Edit Task';
        this.cancelEditBtn.classList.remove('hidden');
        
        // Scroll to form
        this.taskForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Reset form to initial state
    resetForm() {
        this.taskForm.reset();
        this.editTaskId.value = '';
        this.saveTaskBtn.textContent = 'Add Task';
        this.formTitle.textContent = 'Add New Task';
        this.cancelEditBtn.classList.add('hidden');
        
        // Set today's date again
        const today = new Date();
        const formattedDate = today.toISOString().substr(0, 10);
        this.dueDateInput.value = formattedDate;
    }
    
    // Save tasks to localStorage
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
    
    // Display notification
    showNotification(message, type = 'success') {
        this.notification.textContent = message;
        this.notification.className = `notification ${type}`;
        
        // Remove hidden class to show notification
        this.notification.classList.remove('hidden');
        
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
            this.notification.classList.add('hidden');
        }, 3000);
    }
    
    // Filter tasks based on status and search term
    filterTasks() {
        return this.tasks.filter(task => {
            // Filter by status
            if (this.currentFilter === 'completed' && !task.completed) return false;
            if (this.currentFilter === 'pending' && task.completed) return false;

            return true;
        });
    }
    
    // Sort tasks by due date, then by completion status
    sortTasks(tasks) {
        return [...tasks].sort((a, b) => {
            // First sort by completion status (pending first)
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            // Then sort by due date (earlier dates first)
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate) - new Date(b.dueDate);
            }
            
            // If no due date, put tasks without due dates last
            if (a.dueDate && !b.dueDate) return -1;
            if (!a.dueDate && b.dueDate) return 1;
            
            // Finally sort by creation date (newest first)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }
    
    // Render tasks to the DOM
    renderTasks() {
        // Clear the tasks list
        this.tasksListContainer.innerHTML = '';
        
        // Get filtered and sorted tasks
        const filteredTasks = this.filterTasks();
        const sortedTasks = this.sortTasks(filteredTasks);
        
        // Check if there are any tasks to display
        if (sortedTasks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            
            // Different message based on filters
            let message = 'No tasks found. Add a new task to get started!';
            
            if (this.searchTerm) {
                message = `No tasks found matching "${this.searchTerm}".`;
            } else if (this.currentFilter === 'completed') {
                message = 'No completed tasks found.';
            } else if (this.currentFilter === 'pending') {
                message = 'No pending tasks found.';
            }
            
            emptyState.innerHTML = `<p>${message}</p>`;
            this.tasksListContainer.appendChild(emptyState);
            return;
        }
        
        // Create and append task elements
        sortedTasks.forEach(task => {
            // Clone the template
            const taskElement = this.taskTemplate.content.cloneNode(true);
            const taskItem = taskElement.querySelector('.task-item');
            
            // Set task ID
            taskItem.dataset.id = task.id;
            
            // Set completed class if task is completed
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            
            // Fill in task details
            taskItem.querySelector('.task-checkbox').checked = task.completed;
            taskItem.querySelector('.task-name').textContent = task.name;
            
            // Add description if available
            const descriptionElement = taskItem.querySelector('.task-description');
            if (task.description) {
                descriptionElement.textContent = task.description;
            } else {
                descriptionElement.remove();
            }
            
            // Add due date if available
            const dueDateElement = taskItem.querySelector('.task-due-date');
            if (task.dueDate) {
                dueDateElement.textContent = `Due: ${this.formatDate(task.dueDate)}`;
            } else {
                dueDateElement.remove();
            }
            
            // Add the task to the container
            this.tasksListContainer.appendChild(taskItem);
        });
    }
    
    // Format date in a user-friendly way
    formatDate(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        const date = new Date(dateString);
        
        // Check if date is today
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }
        
        // Check if date is tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        }
        
        // Check if date is yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        
        return date.toLocaleDateString('en-US', options);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create a new TaskManager instance
    const taskManager = new TaskManager();
});