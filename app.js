document.addEventListener("DOMContentLoaded", () => {
  const root = document.body;

  // Заголовок
  const header = document.createElement("header");
  const h1 = document.createElement("h1");
  h1.textContent = "To Do лист";
  header.appendChild(h1);
  root.appendChild(header);

  // Контейнер для формы и списка
  const main = document.createElement("main");
  root.appendChild(main);

  // Форма добавления задач
  const formCard = document.createElement("section");
  formCard.className = "form-card";

  const form = document.createElement("form");
  form.className = "todo-form";

  const inputTitle = document.createElement("input");
  inputTitle.type = "text";
  inputTitle.placeholder = "Название задачи";
  inputTitle.required = true;

  const inputDate = document.createElement("input");
  inputDate.type = "date";

  const addBtn = document.createElement("button");
  addBtn.type = "submit";
  addBtn.textContent = "Добавить";

  form.append(inputTitle, inputDate, addBtn);
  formCard.appendChild(form);
  main.appendChild(formCard);

  // Панель управления
  const controls = document.createElement("div");
  controls.className = "controls";

  // фильтр
  const filterSelect = document.createElement("select");
  const optAll = document.createElement("option");
  optAll.value = "all";
  optAll.textContent = "Все";
  const optActive = document.createElement("option");
  optActive.value = "active";
  optActive.textContent = "Активные";
  const optCompleted = document.createElement("option");
  optCompleted.value = "completed";
  optCompleted.textContent = "Выполненные";
  filterSelect.append(optAll, optActive, optCompleted);

  // сортировка
  const sortSelect = document.createElement("select");
  const optNone = document.createElement("option");
  optNone.value = "none";
  optNone.textContent = "Без сортировки";
  const optAsc = document.createElement("option");
  optAsc.value = "asc";
  optAsc.textContent = "Сначала ранние";
  const optDesc = document.createElement("option");
  optDesc.value = "desc";
  optDesc.textContent = "Сначала поздние";
  sortSelect.append(optNone, optAsc, optDesc);

  // поиск
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Поиск по названию...";

  controls.append(filterSelect, sortSelect, searchInput);
  main.appendChild(controls);

  // Список задач
  const taskList = document.createElement("ul");
  taskList.className = "task-list";
  main.appendChild(taskList);

  // LocalStorage
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  // Отрисовка задач
  function renderTasks() {
  // Очистка списка
  while (taskList.firstChild) {
    taskList.removeChild(taskList.firstChild);
  }

  let filtered = tasks;

  // Фильтрация
  const filter = filterSelect.value;
  if (filter === "active") filtered = filtered.filter(t => !t.completed);
  if (filter === "completed") filtered = filtered.filter(t => t.completed);

  // Поиск
  const search = searchInput.value.toLowerCase();
  if (search) filtered = filtered.filter(t => t.title.toLowerCase().includes(search));

  // Сортировка
  const sort = sortSelect.value;
  if (sort === "asc") filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  if (sort === "desc") filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Отрисовка задач
  filtered.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.draggable = true;
    if (task.completed) li.classList.add("completed");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;

    const title = document.createElement("span");
    title.textContent = `${task.title} ${task.date ? "(" + task.date + ")" : ""}`;

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";

    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";

    // События
    checkbox.addEventListener("change", () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    editBtn.addEventListener("click", () => {
      const newTitle = prompt("Измените название:", task.title);
      const newDate = prompt("Измените дату (ГГГГ-ММ-ДД):", task.date);
      if (newTitle !== null) task.title = newTitle;
      if (newDate !== null) task.date = newDate;
      saveTasks();
      renderTasks();
    });

    delBtn.addEventListener("click", () => {
      if (confirm("Удалить задачу?")) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
      }
    });

    li.append(checkbox, title, editBtn, delBtn);
    taskList.appendChild(li);

    // Drag and drop
    li.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", index);
    });
    li.addEventListener("dragover", e => e.preventDefault());
    li.addEventListener("drop", e => {
      const from = e.dataTransfer.getData("text/plain");
      const to = index;
      const [moved] = tasks.splice(from, 1);
      tasks.splice(to, 0, moved);
      saveTasks();
      renderTasks();
    });
  });
}


  // Добавление задачи
  form.addEventListener("submit", e => {
    e.preventDefault();
    const title = inputTitle.value.trim();
    const date = inputDate.value;
    if (!title) return alert("Введите название задачи");

    tasks.push({ title, date, completed: false });
    saveTasks();
    renderTasks();
    form.reset();
  });

  // Фильтры
  filterSelect.addEventListener("change", renderTasks);
  sortSelect.addEventListener("change", renderTasks);
  searchInput.addEventListener("input", renderTasks);

  renderTasks();
});
