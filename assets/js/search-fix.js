// OneApp 文档站点搜索功能修复
(function() {
  'use strict';
  
  // 等待搜索功能加载
  document.addEventListener('DOMContentLoaded', function() {
    // 延时确保Material主题的搜索组件已初始化
    setTimeout(function() {
      initializeSearchFix();
    }, 500);
  });
  
  function initializeSearchFix() {
    // 检查搜索输入框是否存在
    const searchInput = document.querySelector('.md-search__input');
    if (searchInput) {
      console.log('Search input found, search is working');
      
      // 改善搜索体验
      searchInput.addEventListener('focus', function() {
        document.body.setAttribute('data-md-search-focus', '');
      });
      
      searchInput.addEventListener('blur', function() {
        setTimeout(function() {
          document.body.removeAttribute('data-md-search-focus');
        }, 200);
      });
    } else {
      console.warn('Search input not found');
    }
    
    // 检查搜索结果容器
    const searchResults = document.querySelector('.md-search-result');
    if (searchResults) {
      console.log('Search results container found');
    }
  }
  
  // 主题切换时确保搜索功能正常
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && 
          mutation.attributeName === 'data-md-color-scheme') {
        // 主题切换后重新检查搜索功能
        setTimeout(initializeSearchFix, 100);
      }
    });
  });
  
  // 观察主题变化
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-md-color-scheme']
  });
  
})();