// components/TextInput.jsx
const TextInput = ({ value, onChange, placeholder, error, ...props }) => (
  <input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`p-2 rounded bg-gray-700 focus:outline-none w-full ${error ? "border border-red-500" : ""}`}
    {...props}
  />
);

export default TextInput;
