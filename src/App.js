import React, { useState } from "react";
import { Button, Card } from "react-bootstrap";
import './App.css';
import Select from "react-select";

const App = () => {
  const [articles, setArticles] = useState([]);
  const [lang, setLang] = useState("en");
  const [isLoading, setIsLoading] = useState(false);
  const [seenArticles, setSeenArticles] = useState(() => {
    const saved = localStorage.getItem("seenArticles");
    return saved ? JSON.parse(saved) : [];
  });

  const fetchArticles = async () => {
    setIsLoading(true);
    const desiredCount = 10;
    const minLength = 5000; // 5 dakikalık içerik için
    const tempArticles = [];
  
    try {
      while (tempArticles.length < desiredCount) {
        const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?origin=*&action=query&format=json&generator=random&grnnamespace=0&grnlimit=10&prop=info&inprop=url`);
        const data = await res.json();
  
        if (!data.query?.pages) continue;
  
        const pages = Object.values(data.query.pages);
  
        const filtered = pages.filter(
          (page) =>
            !seenArticles.includes(page.title) &&
            page.length >= minLength
        );
  
        const withReadingTime = filtered.map((page) => {
          const count = page.length || 0;
          const readingTime = Math.ceil(count / 1200);
          return { ...page, readingTime };
        });
  
        tempArticles.push(...withReadingTime);
      }
  
      setArticles(tempArticles.slice(0, desiredCount));
    } catch (err) {
      console.error("Error fetching articles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = (page) => {
    window.open(page.fullurl, "_blank");

    const updatedSeen = [...seenArticles, page.title];
    setSeenArticles(updatedSeen);
    localStorage.setItem("seenArticles", JSON.stringify(updatedSeen));

    setArticles((prev) => prev.filter((p) => p.title !== page.title));
  };

  const handleLanguageChange = (selectedOption) => {
    setLang(selectedOption.value);
  };

  const languageOptions = [
    { value: "en", label: "English", flag: "https://flagcdn.com/40x30/us.png" },
    { value: "tr", label: "Türkçe", flag: "https://flagcdn.com/40x30/tr.png" }
  ];

  return (
    <div className="container-fluid p-5 text-center bg-dark text-white min-vh-100">
      <h1 className="my-4">📜Wikipedia Keşfet</h1>
      <div className="language-select-container">
        <Select
          options={languageOptions}
          defaultValue={languageOptions[0]}
          onChange={handleLanguageChange}
          isSearchable={false}
          className="language-select"
          getOptionLabel={(e) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={e.flag} alt={e.label} style={{ width: 20, marginRight: 10 }} />
              {e.label}
            </div>
          )}
          styles={{
            control: (styles) => ({
              ...styles,
              backgroundColor: '#1e1e1e',
              border: 'none',
              color: 'white',
              borderRadius: '50px',
              padding: '0px 10px',
              minWidth: '200px',
              cursor: 'pointer',
              boxShadow: 'none',
            }),
            option: (styles) => ({
              ...styles,
              backgroundColor: '#1e1e1e',
              color: 'white',
              ':hover': {
                backgroundColor: '#333',
              },
              cursor:'pointer'
            }),
            menu: (styles) => ({
              ...styles,
              backgroundColor: '#1e1e1e',
              zIndex: 9999,
            }),
            singleValue: (styles) => ({
              ...styles,
              color: 'white',
            }),
            dropdownIndicator: (styles) => ({
              ...styles,
              color: 'white',
            }),
          }}
        />
      </div>

      <div className="row mt-3">
        <div className="col-12">
          <Button variant="primary" className="h-100" size="lg" onClick={fetchArticles}>
            Başla
          </Button>
        </div>
      </div>

      <div className="mt-5">
        {isLoading && (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        {articles.map((page) => (
          <Card
            key={page.pageid}
            className="mb-3 text-start text-light article-card"
            onClick={() => handleClick(page)}
            style={{ cursor: "pointer" }}
          >
            <Card.Body>
              <div className="reading-time float-end">
                <span role="img" aria-label="eyes">👀</span>
                {page.readingTime} dk
              </div>
              <Card.Title>{page.title}</Card.Title>
              <Card.Text className="text-light">{page.fullurl}</Card.Text>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default App;
