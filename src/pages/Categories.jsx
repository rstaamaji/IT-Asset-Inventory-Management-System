import PlaceholderPage from '../components/PlaceholderPage';

export default function Categories() {
  return (
    <PlaceholderPage
      title="Categories"
      subtitle="Organize assets by type and define category-level policies"
      columns={['Category Name', 'Description', 'Total Assets', 'In Stock', 'Assigned', 'Actions']}
    />
  );
}
