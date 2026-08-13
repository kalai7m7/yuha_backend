import { fetchCategories, fetchFinishTypes, fetchOccasionTypes } from './catalog.repository';

export async function getCategories() {
  return fetchCategories();
}

export async function getFinishTypes() {
  return fetchFinishTypes();
}

export async function getOccasionTypes() {
  return fetchOccasionTypes();
}

export async function getAllCatalog() {
  const [categories, finish_types, occasion_types] = await Promise.all([
    fetchCategories(),
    fetchFinishTypes(),
    fetchOccasionTypes()
  ]);

  return { categories, finish_types, occasion_types };
}
