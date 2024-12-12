import "../styles/Header.css";

function Header() {
  return (
    <header>
      <h1>CCCBuilder</h1>
      <input type="checkbox" name="dark-or-light" id="theme-toggle" />
    </header>
  );
}

export default Header;
