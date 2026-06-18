import { useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiEyeOff,
  FiImage,
  FiPlus,
  FiRefreshCcw,
  FiSearch,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { Flip, toast } from 'react-toastify';


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  floor: "",
  isActive: true,
};

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [meta, setMeta] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [editingRoom, setEditingRoom] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);

  const isEditing = Boolean(editingRoom);

  const selectedPreviews = useMemo(() => {
    return selectedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [selectedFiles]);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    return () => {
      selectedPreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [selectedPreviews]);

  async function fetchRooms(queryValue = search) {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (queryValue.trim()) {
        params.append("search", queryValue.trim());
      }

      params.append("page", "1");
      params.append("limit", "20");

      const response = await fetch(`${API_URL}/rooms?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Error loading rooms");
      }

      const result = await response.json();

      setRooms(result.data || []);
      setMeta(result.meta || null);
    } catch (error) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleFileChange(event) {
    const files = Array.from(event.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    event.target.value = "";
  }

  function removeSelectedFile(index) {
    setSelectedFiles((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function removeExistingPhoto(photoUrl) {
    setExistingPhotos((prev) => prev.filter((photo) => photo !== photoUrl));
  }

  function openCreateForm() {
    setEditingRoom(null);
    setForm(emptyForm);
    setExistingPhotos([]);
    setSelectedFiles([]);
    setShowForm(true);
  }

  function openEditForm(room) {
    window.scrollTo("0", "0");

    setEditingRoom(room);

    setForm({
      name: room.name || "",
      description: room.description || "",
      price: room.price || "",
      floor: room.floor || "",
      isActive: room.isActive ?? true,
    });

    setExistingPhotos(room.photos || []);
    setSelectedFiles([]);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingRoom(null);
    setForm(emptyForm);
    setExistingPhotos([]);
    setSelectedFiles([]);
    setSaving(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", String(form.price));
      formData.append("floor", String(form.floor));
      formData.append("isActive", String(form.isActive));

      /**
       * When editing, these are the old image URLs that should stay.
       * Removed images are NOT sent, so the backend can delete them from S3.
       */
      if (isEditing) {
        formData.append("photosToKeep", JSON.stringify(existingPhotos));
      }

      /**
       * New image files.
       */
      selectedFiles.forEach((file) => {
        formData.append("photos", file);
      });

      const url = isEditing
        ? `${API_URL}/rooms/${editingRoom.id}`
        : `${API_URL}/rooms`;

      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          isEditing ? "Error updating room" : "Error creating room",
        );
      }

      await fetchRooms();
      closeForm();
    } catch (error) {
      setError(error.message || "Something went wrong");
    } finally {
      toast.success("Successful !!", {
        position: "top-center",
        autoClose: 2000,
        theme: "light",
        transition: Flip
      });
      setSaving(false);
    }
  }

  async function handleDeactivate(roomId) {
    const confirmed = window.confirm("Do you want to deactivate this room?");

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(`${API_URL}/rooms/${roomId}/deactivate`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Error deactivating room");
      }

      await fetchRooms();
    } catch (error) {
      setError(error.message || "Something went wrong");
    }
  }

  async function handleDelete(roomId) {
    const confirmed = window.confirm(
      "Do you want to delete this room? This will also delete its images from S3.",
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(`${API_URL}/rooms/${roomId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error deleting room");
      }

      await fetchRooms();
    } catch (error) {
      setError(error.message || "Something went wrong");
    }
  }

  return (
    <div className="pb-24 md:pb-10">
      <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
              StayBook Rooms
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Manage rooms
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Create, update, deactivate, and delete hotel rooms. Room photos
              are uploaded directly to your S3 bucket through the backend.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <FiPlus />
            New room
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3">
            <FiSearch className="text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") fetchRooms();
              }}
              placeholder="Search rooms by name or description"
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="button"
            onClick={() => fetchRooms()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <FiRefreshCcw />
            Search
          </button>
        </div>

        {error && (
          <div className="mt-5 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
      </section>

      {showForm && (
        <section className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                {isEditing ? "Edit room" : "Create room"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {isEditing
                  ? "Update room information, remove old images, or add new ones."
                  : "Complete the information and upload room photos."}
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
            >
              <FiX />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  placeholder="101"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Price per night
                </label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  placeholder="120.00"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Floor
                </label>
                <input
                  name="floor"
                  type="number"
                  min="1"
                  value={form.floor}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  placeholder="2"
                />
              </div>

              <div className="flex items-end">
                <label className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  <input
                    name="isActive"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  Active room
                </label>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                placeholder="Room description..."
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Photos
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center transition hover:bg-slate-100">
                <FiUpload className="mb-3 text-2xl text-slate-500" />
                <p className="text-sm font-semibold text-slate-800">
                  Upload room photos
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  PNG, JPG, WEBP. You can select multiple images.
                </p>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {(existingPhotos.length > 0 || selectedPreviews.length > 0) && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {existingPhotos.map((photoUrl) => (
                    <div
                      key={photoUrl}
                      className="group relative overflow-hidden rounded-3xl bg-slate-100"
                    >
                      <img
                        src={photoUrl}
                        alt="Existing room"
                        className="h-40 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeExistingPhoto(photoUrl)}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white opacity-100 transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <FiX />
                      </button>

                      <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
                        Saved
                      </div>
                    </div>
                  ))}

                  {selectedPreviews.map((item, index) => (
                    <div
                      key={`${item.file.name}-${index}`}
                      className="group relative overflow-hidden rounded-3xl bg-slate-100"
                    >
                      <img
                        src={item.url}
                        alt="New room"
                        className="h-40 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white opacity-100 transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <FiX />
                      </button>

                      <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
                        New
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : isEditing
                    ? "Save changes"
                    : "Create room"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="mt-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Rooms list
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {meta ? `${meta.total} rooms found` : "Manage your inventory"}
            </p>
          </div>
        </div>

        {loading && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-[2rem] bg-slate-100"
              />
            ))}
          </div>
        )}

        {!loading && rooms.length === 0 && (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <FiImage className="text-xl text-slate-500" />
            </div>

            <h3 className="text-lg font-bold text-slate-950">No rooms found</h3>
            <p className="mt-2 text-sm text-slate-500">
              Create your first room to start managing hotel inventory.
            </p>
          </div>
        )}

        {!loading && rooms.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => {
              const image =
                room.photos?.[0] ||
                "https://technical-test-abu-dhabi.s3.us-east-1.amazonaws.com/room.jpg";

              return (
                <article
                  key={room.id}
                  className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-56 bg-slate-100">
                    <img
                      src={image}
                      alt={room.name}
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700">
                      Floor {room.floor}
                    </div>

                    <div
                      className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${
                        room.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {room.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-950">
                          {room.name}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                          {room.description}
                        </p>
                      </div>

                      <p className="whitespace-nowrap text-base font-bold text-slate-950">
                        ${Number(room.price).toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                      <FiImage />
                      <span>{room.photos?.length || 0} photos</span>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(room)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        <FiEdit2 />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeactivate(room.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-50 px-3 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                      >
                        <FiEyeOff />
                        Off
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(room.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-3 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        <FiTrash2 />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
