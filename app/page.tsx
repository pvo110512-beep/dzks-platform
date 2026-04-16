"use client";

import { ChangeEvent, Fragment, useMemo, useState } from "react";

type DocumentState = "Приложен" | "Не требуется";
type RequestStatus =
  | "Поставлено"
  | "В работе"
  | "Не поставлено"
  | "Нужны документы"
  | "Есть проблема";

type DocumentKey = "sogl" | "mvk" | "order";

type RequestDocument = {
  status: DocumentState;
  fileName: string;
};

type RequestDocuments = {
  sogl: RequestDocument;
  mvk: RequestDocument;
  order: RequestDocument;
};

type RequestItem = {
  id: number;
  number: string;
  creatorName: string;
  dsNumber: string;
  dsDate: string;
  contractNumber: string;
  easuzNumber: string;
  dsSubject: string;
  contractSubject: string;
  status: RequestStatus;
  reason: string;
  documents: RequestDocuments;
};

type FormState = {
  creatorName: string;
  dsNumber: string;
  dsDate: string;
  contractNumber: string;
  easuzNumber: string;
  dsSubject: string;
  contractSubject: string;
  documents: RequestDocuments;
};

const requestYear = new Date().getFullYear();

const departmentLabels = ["Экономисты", "Закупки", "Бухгалтерия"];

const featureCards = [
  {
    eyebrow: "Сопровождение ДС",
    title: "Реестр по дополнительным соглашениям выглядит цельно и остаётся рабочим",
    description:
      "Форма, таблица и детализация держатся в одном визуальном контуре и не теряют операционный смысл.",
  },
  {
    eyebrow: "Контроль комплекта",
    title: "По документам сразу видно статус и фактически приложенные файлы",
    description:
      "Согл, МВК, распоряжение и файл ДС сопровождаются названиями файлов, поэтому спорных мест становится меньше.",
  },
];

const documentBlocks: Array<{ key: DocumentKey; label: string }> = [
  { key: "sogl", label: "Согл" },
  { key: "mvk", label: "МВК" },
  { key: "order", label: "Распоряжение" },
];

const createInitialFormData = (): FormState => ({
  creatorName: "",
  dsNumber: "",
  dsDate: "",
  contractNumber: "",
  easuzNumber: "",
  dsSubject: "",
  contractSubject: "",
  documents: {
    sogl: { status: "Не требуется", fileName: "" },
    mvk: { status: "Не требуется", fileName: "" },
    order: { status: "Не требуется", fileName: "" },
  },
});

const createRequestNumber = (sequence: number) => `${sequence}/${requestYear}`;

const extractSequence = (number: string) => {
  const [sequencePart] = number.split("/");
  const parsedValue = Number(sequencePart);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const getStatusMeta = (status: RequestStatus) => {
  if (status === "Поставлено") {
    return {
      dot: "bg-emerald-500",
      badge:
        "border border-emerald-300/70 bg-emerald-100 text-emerald-950",
    };
  }

  if (status === "В работе") {
    return {
      dot: "bg-amber-400",
      badge: "border border-amber-300/70 bg-amber-100 text-amber-950",
    };
  }

  return {
    dot: "bg-rose-500",
    badge: "border border-rose-300/70 bg-rose-100 text-rose-950",
  };
};

const getDocumentStateMeta = (status: DocumentState) => {
  if (status === "Приложен") {
    return "border border-emerald-300/70 bg-emerald-50 text-emerald-900";
  }

  return "border border-slate-300/70 bg-slate-100 text-slate-700";
};

const getLeaderForRange = (requests: RequestItem[], days?: number) => {
  const now = new Date();
  const rangeStart = new Date(now);

  if (typeof days === "number") {
    rangeStart.setDate(now.getDate() - days + 1);
  } else {
    rangeStart.setDate(1);
  }

  const filteredRequests = requests.filter((request) => {
    const requestDate = new Date(request.dsDate);
    if (Number.isNaN(requestDate.getTime())) {
      return false;
    }

    if (typeof days === "number") {
      return requestDate >= rangeStart && requestDate <= now;
    }

    return (
      requestDate.getMonth() === now.getMonth() &&
      requestDate.getFullYear() === now.getFullYear()
    );
  });

  const source = filteredRequests.length > 0 ? filteredRequests : requests;
  const counts = new Map<string, number>();

  source.forEach((request) => {
    counts.set(request.creatorName, (counts.get(request.creatorName) ?? 0) + 1);
  });

  const [name = "Нет данных", total = 0] =
    [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];

  return { name, total };
};

const formatActualDateTime = (date: Date) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRequestId, setExpandedRequestId] = useState<number | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([
    {
      id: 1,
      number: createRequestNumber(1),
      creatorName: "Иванов И.И.",
      dsNumber: "ДС-17/26",
      dsDate: "2026-04-14",
      contractNumber: "К-41/2026",
      easuzNumber: "3200001456789000412",
      dsSubject: "Изменение сроков исполнения дополнительного соглашения",
      contractSubject: "Услуги по техническому сопровождению объекта",
      status: "В работе",
      reason: "",
      documents: {
        sogl: { status: "Приложен", fileName: "sogl-ds-17.pdf" },
        mvk: { status: "Приложен", fileName: "mvk-ds-17.pdf" },
        order: { status: "Не требуется", fileName: "" },
      },
    },
    {
      id: 2,
      number: createRequestNumber(2),
      creatorName: "Петрова А.С.",
      dsNumber: "ДС-18/26",
      dsDate: "2026-04-10",
      contractNumber: "К-12/2026",
      easuzNumber: "3200001456789000521",
      dsSubject: "Уточнение объёма поставки по дополнительному соглашению",
      contractSubject: "Поставка инженерного оборудования",
      status: "Нужны документы",
      reason: "Не приложены МВК и файл согласования исполнителя.",
      documents: {
        sogl: { status: "Приложен", fileName: "sogl-ds-18.pdf" },
        mvk: { status: "Приложен", fileName: "" },
        order: { status: "Приложен", fileName: "order-ds-18.pdf" },
      },
    },
    {
      id: 3,
      number: createRequestNumber(3),
      creatorName: "Иванов И.И.",
      dsNumber: "ДС-19/26",
      dsDate: "2026-04-03",
      contractNumber: "К-77/2026",
      easuzNumber: "3200001456789000663",
      dsSubject: "Финальная редакция дополнительного соглашения",
      contractSubject: "Выполнение строительно-монтажных работ",
      status: "Поставлено",
      reason: "",
      documents: {
        sogl: { status: "Приложен", fileName: "sogl-ds-19.pdf" },
        mvk: { status: "Приложен", fileName: "mvk-ds-19.pdf" },
        order: { status: "Приложен", fileName: "order-ds-19.pdf" },
      },
    },
  ]);
  const [formData, setFormData] = useState<FormState>(createInitialFormData);

  const nextRequestNumber = createRequestNumber(
    requests.reduce(
      (maxSequence, request) =>
        Math.max(maxSequence, extractSequence(request.number)),
      0,
    ) + 1,
  );

  const inProgressCount = requests.filter(
    (request) => request.status === "В работе",
  ).length;
  const completedCount = requests.filter(
    (request) => request.status === "Поставлено",
  ).length;
  const notRegisteredCount = requests.filter((request) =>
    ["Не поставлено", "Нужны документы", "Есть проблема"].includes(
      request.status,
    ),
  ).length;
  const actualDateTime = formatActualDateTime(new Date());

  const leaders = useMemo(
    () => ({
      day: getLeaderForRange(requests, 1),
      week: getLeaderForRange(requests, 7),
      month: getLeaderForRange(requests),
    }),
    [requests],
  );

  const filteredRequests = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return requests;
    }

    return requests.filter((request) =>
      [request.number, request.dsNumber, request.contractNumber, request.easuzNumber]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [requests, searchQuery]);

  const handleDocumentStatusChange = (
    key: DocumentKey,
    status: DocumentState,
  ) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [key]: {
          status,
          fileName: status === "Приложен" ? prev.documents[key].fileName : "",
        },
      },
    }));
  };

  const handleDocumentFileChange =
    (key: DocumentKey) => (event: ChangeEvent<HTMLInputElement>) => {
      const fileName = event.target.files?.[0]?.name ?? "";

      setFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [key]: {
            ...prev.documents[key],
            fileName,
          },
        },
      }));
    };

  const handleSave = () => {
    if (
      !formData.creatorName.trim() ||
      !formData.dsNumber.trim() ||
      !formData.dsDate ||
      !formData.contractNumber.trim() ||
      !formData.easuzNumber.trim() ||
      !formData.dsSubject.trim() ||
      !formData.contractSubject.trim()
    ) {
      alert("Заполни договорника и обязательные поля по ДС, контракту, ЕАСУЗ и предмету соглашения.");
      return;
    }

    const requiredDocument = documentBlocks.find(
      (block) =>
        formData.documents[block.key].status === "Приложен" &&
        !formData.documents[block.key].fileName,
    );

    if (requiredDocument) {
      alert(`Для блока "${requiredDocument.label}" выбран статус "Приложен", но файл не добавлен.`);
      return;
    }

    const newRequest: RequestItem = {
      id: Date.now(),
      number: nextRequestNumber,
      creatorName: formData.creatorName.trim(),
      dsNumber: formData.dsNumber,
      dsDate: formData.dsDate,
      contractNumber: formData.contractNumber,
      easuzNumber: formData.easuzNumber,
      dsSubject: formData.dsSubject,
      contractSubject: formData.contractSubject,
      status: "В работе",
      reason: "",
      documents: formData.documents,
    };

    setRequests((prev) => [newRequest, ...prev]);
    setExpandedRequestId(newRequest.id);
    setFormData(createInitialFormData());
    setShowForm(false);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="relative isolate">
        <div className="absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(circle_at_top_left,rgba(247,198,126,0.18),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(109,146,255,0.24),transparent_30%),linear-gradient(180deg,#10203a_0%,#08111f_58%,#07111f_100%)]" />
        <div className="absolute left-[-120px] top-24 h-72 w-72 rounded-full bg-[#f0b55d]/12 blur-3xl" />
        <div className="absolute right-[-80px] top-36 h-80 w-80 rounded-full bg-[#4f7cff]/16 blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-5 py-6 md:px-8 md:py-8 lg:px-10">
          <section className="overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.06] shadow-[0_28px_90px_rgba(1,8,20,0.55)] backdrop-blur-xl">
            <div className="grid gap-8 px-6 py-7 md:px-8 md:py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-10">
              <div className="relative">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-slate-200">
                  <span className="h-2 w-2 rounded-full bg-[#f0c37b]" />
                  Социальные объекты вовремя
                </div>
                <h1 className="max-w-3xl text-3xl font-medium tracking-[-0.03em] text-white md:text-4xl lg:text-5xl">
                  Реестр сопровождения БО
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                  Актуальность данных, статусы в работе, постановка на учет и
                  проблемные позиции — в одном экране.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="flex min-h-[172px] flex-col rounded-[26px] border border-white/10 bg-white/[0.05] p-5">
                    <div className="text-sm uppercase tracking-[0.22em] text-slate-400">
                      Данные актуальны
                    </div>
                    <div className="mt-4 text-2xl font-medium leading-tight text-white">
                      {actualDateTime}
                    </div>
                    <p className="mt-auto pt-6 text-sm text-slate-400">
                      последнее обновление
                    </p>
                  </div>
                  <div className="flex min-h-[172px] flex-col rounded-[26px] border border-white/10 bg-white/[0.05] p-5">
                    <div className="text-sm uppercase tracking-[0.22em] text-slate-400">
                      БО в работе
                    </div>
                    <div className="mt-4 text-4xl font-medium leading-none text-[#ffd18c]">
                      {inProgressCount}
                    </div>
                    <p className="mt-auto pt-6 text-sm text-slate-400">
                      на сопровождении
                    </p>
                  </div>
                  <div className="flex min-h-[172px] flex-col rounded-[26px] border border-white/10 bg-white/[0.05] p-5">
                    <div className="text-sm uppercase tracking-[0.22em] text-slate-400">
                      Поставлено на учет
                    </div>
                    <div className="mt-4 text-4xl font-medium leading-none text-[#8bd5b7]">
                      {completedCount}
                    </div>
                    <p className="mt-auto pt-6 text-sm text-slate-400">
                      обработано
                    </p>
                  </div>
                  <div className="flex min-h-[172px] flex-col rounded-[26px] border border-rose-300/20 bg-[linear-gradient(180deg,rgba(148,52,74,0.16)_0%,rgba(255,255,255,0.05)_100%)] p-5 shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
                    <div className="text-sm uppercase tracking-[0.22em] text-rose-100/85">
                      Не поставлено на учет
                    </div>
                    <div className="mt-4 text-4xl font-medium leading-none text-[#ffb1a8]">
                      {notRegisteredCount}
                    </div>
                    <p className="mt-auto pt-6 text-sm text-rose-100/75">
                      требует внимания
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 rounded-[32px] bg-[linear-gradient(180deg,rgba(240,181,93,0.18)_0%,rgba(240,181,93,0)_42%,rgba(79,124,255,0.08)_100%)] blur-2xl" />
                <div className="relative h-full rounded-[32px] border border-white/10 bg-[#0a1729]/90 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.26em] text-slate-400">
                        Операционный обзор
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold text-white">
                        Рабочий контур ДС
                      </h2>
                    </div>
                    <div className="rounded-full border border-[#f0c37b]/30 bg-[#f0c37b]/10 px-3 py-1 text-sm text-[#ffd79d]">
                      MVP
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="rounded-[24px] border border-white/8 bg-white/[0.05] p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-400">Подразделения</p>
                          <p className="mt-1 text-lg font-medium text-white">
                            {departmentLabels.join(" • ")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-400">Следующий номер</p>
                          <p className="mt-1 text-lg font-semibold text-[#ffd18c]">
                            {nextRequestNumber}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_100%)] p-4">
                        <p className="text-sm text-slate-400">Фокус внимания</p>
                        <p className="mt-3 text-2xl font-semibold text-white">
                          {showForm ? "Форма открыта" : "Таблица активна"}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          Интерфейс держит спокойный ритм даже при длинной форме.
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(240,181,93,0.12)_0%,rgba(255,255,255,0.04)_100%)] p-4">
                        <p className="text-sm text-slate-400">Последний поиск</p>
                        <p className="mt-3 text-2xl font-semibold text-white">
                          {searchQuery.trim() || "Без фильтра"}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          Можно быстро отобрать заявки по номеру, ДС, контракту и ЕАСУЗ.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(7,17,31,0.32)_0%,rgba(255,255,255,0.03)_100%)] p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-400">
                            Рабочее состояние
                          </p>
                          <p className="mt-2 text-xl font-semibold text-white">
                            Заявка открывается прямо из таблицы и показывает
                            полный комплект документов без отдельной страницы.
                          </p>
                        </div>
                        <div className="hidden h-14 w-14 rounded-2xl border border-white/10 bg-white/[0.05] sm:flex sm:items-center sm:justify-center">
                          <div className="h-6 w-6 rounded-full bg-[radial-gradient(circle,#ffd18c_0%,#f0b55d_45%,transparent_75%)]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-3">
            {featureCards.map((card) => (
              <article
                key={card.title}
                className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_100%)] p-6 shadow-[0_18px_55px_rgba(1,8,20,0.28)] backdrop-blur"
              >
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#f0b55d]/10 blur-2xl transition duration-500 group-hover:scale-110" />
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-lg text-[#ffd18c]">
                  ✦
                </div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                  {card.eyebrow}
                </p>
                <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">
                  {card.title}
                </h2>
                <p className="mt-4 text-[15px] leading-7 text-slate-300">
                  {card.description}
                </p>
              </article>
            ))}

            <article className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_100%)] p-6 shadow-[0_18px_55px_rgba(1,8,20,0.28)] backdrop-blur">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#4f7cff]/12 blur-2xl" />
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-lg text-[#ffd18c]">
                ★
              </div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Активность
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">
                Лидеры по количеству заявок
              </h2>
              <div className="mt-5 space-y-3">
                {[
                  {
                    label: "Лидер дня",
                    value: leaders.day,
                    caption: "Самый активный договорник за последние сутки.",
                  },
                  {
                    label: "Лидер недели",
                    value: leaders.week,
                    caption: "Больше всего заявок за последние семь дней.",
                  },
                  {
                    label: "Лидер месяца",
                    value: leaders.month,
                    caption: "Лучшая динамика по текущему месяцу.",
                  },
                ].map((leader) => (
                  <div
                    key={leader.label}
                    className="rounded-[22px] border border-white/8 bg-white/[0.05] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-400">{leader.label}</p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {leader.value.name}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-300">
                          {leader.caption}
                        </p>
                      </div>
                      <div className="rounded-full border border-[#f0c37b]/30 bg-[#f0c37b]/10 px-3 py-1 text-sm text-[#ffd79d]">
                        {leader.value.total}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
          <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_100%)] p-4 shadow-[0_24px_80px_rgba(1,8,20,0.32)] backdrop-blur md:p-6">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#f0b55d]/10 blur-3xl" />
            <div className="absolute bottom-0 left-10 h-48 w-48 rounded-full bg-[#4f7cff]/10 blur-3xl" />

            <div className="relative rounded-[30px] border border-white/8 bg-[#f7f1e7] p-5 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] md:p-7">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
                    Рабочий реестр
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 md:text-4xl">
                    Заявки по сопровождению ДС
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                    Добавление записи, автонумерация и цветовая логика сохранены.
                    Сверху появились поиск, файлы и раскрытие полной карточки заявки.
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0d2042_0%,#18386d_100%)] px-5 py-3 text-sm font-medium text-white shadow-[0_16px_34px_rgba(12,31,64,0.24)] transition hover:-translate-y-0.5"
                >
                  {showForm ? "Скрыть форму" : "Создать заявку"}
                </button>
              </div>

              {showForm && (
                <div className="mb-6 rounded-[28px] border border-slate-300/70 bg-[linear-gradient(180deg,#fffaf2_0%,#f8f1e4_100%)] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] md:p-6">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                        Новая запись
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                        Заявка на сопровождение ДС
                      </h3>
                    </div>
                    <div className="hidden rounded-full border border-[#d7b477] bg-[#f5dfb5]/60 px-3 py-1 text-sm text-slate-700 md:block">
                      Номер {nextRequestNumber}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Номер заявки
                      </label>
                      <input
                        type="text"
                        value={nextRequestNumber}
                        disabled
                        className="w-full rounded-2xl border border-slate-300/80 bg-slate-100 px-4 py-3 text-slate-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Создал заявку
                      </label>
                      <input
                        type="text"
                        placeholder="Например: Иванов И.И."
                        value={formData.creatorName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            creatorName: e.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#18386d] focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Номер ДС
                      </label>
                      <input
                        type="text"
                        placeholder="Например: ДС-20/26"
                        value={formData.dsNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, dsNumber: e.target.value })
                        }
                        className="w-full rounded-2xl border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#18386d] focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Дата ДС
                      </label>
                      <input
                        type="date"
                        value={formData.dsDate}
                        onChange={(e) =>
                          setFormData({ ...formData, dsDate: e.target.value })
                        }
                        className="w-full rounded-2xl border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-[#18386d] focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Номер контракта
                      </label>
                      <input
                        type="text"
                        placeholder="Например: К-125/2026"
                        value={formData.contractNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contractNumber: e.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#18386d] focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Реестровый номер ЕАСУЗ
                      </label>
                      <input
                        type="text"
                        placeholder="Например: 3200001456789000777"
                        value={formData.easuzNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            easuzNumber: e.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#18386d] focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                    <div className="md:col-span-2 xl:col-span-3">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Предмет дополнительного соглашения
                      </label>
                      <input
                        type="text"
                        placeholder="Например: Изменение сроков и условий исполнения"
                        value={formData.dsSubject}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dsSubject: e.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#18386d] focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                    <div className="md:col-span-2 xl:col-span-3">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Предмет контракта
                      </label>
                      <input
                        type="text"
                        placeholder="Например: Выполнение проектных и строительно-монтажных работ"
                        value={formData.contractSubject}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contractSubject: e.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-slate-300/80 bg-white/90 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#18386d] focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="mb-3">
                      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                        Документы
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        По умолчанию все документы отмечены как не требующиеся.
                        Если выбрать приложенный документ, ниже сразу появится загрузка файла.
                      </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      {documentBlocks.map((block) => (
                        <div
                          key={block.key}
                          className="flex h-full flex-col rounded-[24px] border border-slate-300/70 bg-white/70 p-4"
                        >
                          <label className="mb-2 block text-sm font-medium text-slate-700">
                            {block.label}
                          </label>
                          <select
                            value={formData.documents[block.key].status}
                            onChange={(e) =>
                              handleDocumentStatusChange(
                                block.key,
                                e.target.value as DocumentState,
                              )
                            }
                            className="w-full rounded-2xl border border-slate-300/80 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#18386d] focus:ring-4 focus:ring-blue-100"
                          >
                            <option>Приложен</option>
                            <option>Не требуется</option>
                          </select>
                          {formData.documents[block.key].status === "Приложен" && (
                            <div className="mt-3">
                              <input
                                type="file"
                                onChange={handleDocumentFileChange(block.key)}
                                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-[#0d2042] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                              />
                              <p className="mt-2 text-xs text-slate-500">
                                {formData.documents[block.key].fileName ||
                                  "Файл пока не выбран"}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      onClick={handleSave}
                      className="rounded-2xl bg-[linear-gradient(135deg,#d8b16a_0%,#f1d39b_100%)] px-5 py-3 font-medium text-slate-950 shadow-[0_12px_30px_rgba(216,177,106,0.28)] transition hover:-translate-y-0.5"
                    >
                      Сохранить
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-5 flex flex-col gap-4 rounded-[26px] border border-slate-300/70 bg-white/70 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                    Поиск по реестру
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Фильтрация по номеру заявки, ДС, контракту и ЕАСУЗ.
                  </p>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Например: 2/2026, ДС-18/26, К-12/2026"
                  className="w-full rounded-2xl border border-slate-300/80 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 md:max-w-md focus:border-[#18386d] focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="overflow-hidden rounded-[28px] border border-slate-300/70 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-[#f3ede4]">
                      <tr>
                        <th className="w-14 px-4 py-4 text-left text-sm font-semibold text-slate-700">
                          Статус
                        </th>
                        <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                          Номер заявки
                        </th>
                        <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                          Создал заявку
                        </th>
                        <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                          Номер ДС
                        </th>
                        <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                          Номер контракта
                        </th>
                        <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                          ЕАСУЗ
                        </th>
                        <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                          Статус заявки
                        </th>
                        <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                          Причина
                        </th>
                        <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                          Действие
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {filteredRequests.map((request) => {
                        const statusMeta = getStatusMeta(request.status);
                        const isExpanded = expandedRequestId === request.id;

                        return (
                          <Fragment key={request.id}>
                            <tr
                              className="border-t border-slate-200/80 transition hover:bg-[#fcf7ef]"
                            >
                              <td className="px-4 py-4">
                                <div
                                  className={`h-3.5 w-3.5 rounded-full ${statusMeta.dot}`}
                                />
                              </td>
                              <td className="px-5 py-4 text-sm font-medium text-slate-950">
                                <div>{request.number}</div>
                                <div className="mt-1 text-xs text-slate-500">
                                  {request.dsDate}
                                </div>
                              </td>
                              <td className="px-5 py-4 text-sm text-slate-700">
                                <div className="font-medium text-slate-950">
                                  {request.creatorName}
                                </div>
                                <div className="mt-1 text-xs text-slate-500">
                                  договорник
                                </div>
                              </td>
                              <td className="px-5 py-4 text-sm text-slate-700">
                                {request.dsNumber}
                              </td>
                              <td className="px-5 py-4 text-sm text-slate-700">
                                {request.contractNumber}
                              </td>
                              <td className="px-5 py-4 text-sm text-slate-700">
                                {request.easuzNumber}
                              </td>
                              <td className="px-5 py-4 text-sm">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusMeta.badge}`}
                                >
                                  {request.status}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-sm text-slate-700">
                                {request.reason || "Без замечаний"}
                              </td>
                              <td className="px-5 py-4 text-sm">
                                <button
                                  onClick={() =>
                                    setExpandedRequestId((prev) =>
                                      prev === request.id ? null : request.id,
                                    )
                                  }
                                  className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-700 transition hover:bg-slate-100"
                                >
                                  {isExpanded ? "Скрыть" : "Подробнее"}
                                </button>
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr className="border-t border-slate-200/70 bg-[#fcf7ef]">
                                <td colSpan={9} className="px-5 py-5">
                                  <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                      <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                          Номер заявки
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-slate-950">
                                          {request.number}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                          Кто создал
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-slate-950">
                                          {request.creatorName}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                          Номер ДС
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-slate-950">
                                          {request.dsNumber}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                          Дата ДС
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-slate-950">
                                          {request.dsDate}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                          Номер контракта
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-slate-950">
                                          {request.contractNumber}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                          ЕАСУЗ
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-slate-950">
                                          {request.easuzNumber}
                                        </p>
                                      </div>
                                      <div className="md:col-span-2 xl:col-span-3">
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                          Предмет дополнительного соглашения
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-slate-950">
                                          {request.dsSubject}
                                        </p>
                                      </div>
                                      <div className="md:col-span-2 xl:col-span-3">
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                          Предмет контракта
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-slate-950">
                                          {request.contractSubject}
                                        </p>
                                      </div>
                                      <div className="md:col-span-2 xl:col-span-3">
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                          Статусы документов и файлы
                                        </p>
                                        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                          {documentBlocks.map((block) => (
                                            <div
                                              key={block.key}
                                              className="rounded-[18px] border border-slate-200 bg-slate-50 p-3"
                                            >
                                              <p className="text-sm font-medium text-slate-900">
                                                {block.label}
                                              </p>
                                              <span
                                                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getDocumentStateMeta(
                                                  request.documents[block.key].status,
                                                )}`}
                                              >
                                                {request.documents[block.key].status}
                                              </span>
                                              <p className="mt-2 text-xs text-slate-500">
                                                {request.documents[block.key].fileName ||
                                                  "Файл не требуется"}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                          Статус заявки
                                        </p>
                                        <span
                                          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusMeta.badge}`}
                                        >
                                          {request.status}
                                        </span>
                                      </div>
                                      <div className="md:col-span-2">
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                          Причина
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-slate-950">
                                          {request.reason || "Без замечаний"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
