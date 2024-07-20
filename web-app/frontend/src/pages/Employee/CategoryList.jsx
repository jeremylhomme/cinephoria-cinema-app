import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import LoaderFull from "../../components/LoaderFull";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../redux/api/categoryApiSlice";

const CategoryList = () => {
  const {
    data: categories,
    refetch,
    isLoading,
    error,
  } = useGetCategoriesQuery();

  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [editableCategoryId, setEditableCategoryId] = useState(null);
  const [editableCategoryName, setEditableCategoryName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    refetch();
  }, [refetch]);

  const toggleEdit = (id, categoryName) => {
    setEditableCategoryId(id);
    setEditableCategoryName(categoryName);
  };

  const saveHandler = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }
    try {
      await createCategory({ categoryName: newCategoryName }).unwrap();
      setNewCategoryName("");
      refetch();
      toast.success("La catégorie a été ajoutée avec succès !");
    } catch (err) {
      toast.error(`Failed to add category: ${err.data?.message || err.error}`);
    }
  };

  const updateHandler = async (id) => {
    if (!editableCategoryName.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }
    try {
      await updateCategory({
        categoryId: id,
        updatedCategory: { categoryName: editableCategoryName },
      }).unwrap();
      setEditableCategoryId(null);
      setEditableCategoryName("");
      refetch();
      toast.success("Category updated successfully!");
    } catch (err) {
      toast.error(
        `Failed to update category: ${err.data?.message || err.error}`
      );
    }
  };

  const deleteHandler = async (id) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")
    ) {
      try {
        await deleteCategory(id).unwrap();
        refetch();
        toast.success("Category deleted successfully!");
      } catch (err) {
        toast.error(
          `Failed to delete category: ${err.data?.message || err.error}`
        );
      }
    }
  };

  if (isLoading) return <LoaderFull />;
  if (error) return <p>Error fetching categories.</p>;

  const sortedCategories = categories
    ? [...categories].sort((a, b) => a.id - b.id)
    : [];

  return (
    <div className="py-16">
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 sm:px-6">
            <div className="max-w-lg mx-auto sm:flex sm:items-center justify-between">
              <header>
                <div className="max-w-7xl">
                  <h1 className="text-3xl font-bold leading-tight tracking-tight">
                    Catégories
                  </h1>
                </div>
              </header>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Link
                  to="/movie-list"
                  className="block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                >
                  Gestion des films
                </Link>
              </div>
            </div>

            <div className="mt-8 flow-root">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="bg-white px-8 py-8 mt-6 rounded-md sm:mx-auto sm:w-full sm:max-w-lg shadow-sm">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0 w-1/4"
                        >
                          ID
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 px-3 text-left text-sm font-semibold w-1/2"
                        >
                          Nom de la catégorie
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 px-3 text-left text-sm font-semibold w-1/4"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sortedCategories.map((category) => (
                        <tr key={category.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                            {category.id}
                          </td>
                          <td className="whitespace-normal py-4 px-3 text-sm">
                            {editableCategoryId === category.id ? (
                              <input
                                type="text"
                                value={editableCategoryName}
                                onChange={(e) =>
                                  setEditableCategoryName(e.target.value)
                                }
                                className="w-full p-2 border rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500"
                              />
                            ) : (
                              category.categoryName
                            )}
                          </td>
                          <td className="whitespace-nowrap py-4 px-3 text-sm">
                            {editableCategoryId === category.id ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => updateHandler(category.id)}
                                  className="text-white rounded-md bg-green-700 p-2 text-sm font-semibold shadow-sm hover:bg-green-800"
                                >
                                  Enregistrer
                                </button>
                                <button
                                  onClick={() => setEditableCategoryId(null)}
                                  className="block px-2 py-1 text-center text-sm font-semibold text-gray-600 hover:text-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                                >
                                  Annuler
                                </button>
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    toggleEdit(
                                      category.id,
                                      category.categoryName
                                    )
                                  }
                                  className="text-gray-500"
                                >
                                  <PencilSquareIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => deleteHandler(category.id)}
                                  className="text-gray-500"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="bg-white px-8 py-8 rounded-md sm:mx-auto sm:w-full sm:max-w-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">
                  Ajouter une nouvelle catégorie
                </h2>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nom de la catégorie"
                    className="w-full p-2 border rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <button
                    onClick={saveHandler}
                    className={`rounded-md px-3 py-2 text-sm ${
                      newCategoryName.trim()
                        ? "bg-green-700 text-white hover:bg-green-800"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                    disabled={!newCategoryName.trim()}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CategoryList;
