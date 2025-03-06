// components/ThColumn.jsx
const ThColumn = ({ label, sortKey, sortState, onSort }) => {
  const { sortKey: currentKey, sortOrder } = sortState;
  const arrow = currentKey === sortKey ? (sortOrder === "asc" ? " ▲" : " ▼") : "";
  return (
    <th className="p-2 cursor-pointer whitespace-nowrap" onClick={() => onSort(sortKey)}>
      {label}{arrow}
    </th>
  );
};

export default ThColumn;
