// OneApp Mermaid 配置 - 简化版
(function() {
  'use strict';
  
  // 等待页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMermaid);
  } else {
    initializeMermaid();
  }
  
  function initializeMermaid() {
    // 检查Mermaid是否已加载
    if (typeof mermaid === 'undefined') {
      console.warn('Mermaid not loaded');
      return;
    }
    
    // 配置Mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      themeVariables: {
        primaryColor: '#1976d2',
        primaryTextColor: '#000000',
        primaryBorderColor: '#1976d2',
        lineColor: '#333333',
        secondaryColor: '#ffffff',
        tertiaryColor: '#ffffff'
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      sequence: {
        useMaxWidth: true,
        wrap: true,
        width: 150,
        height: 65
      },
      gantt: {
        useMaxWidth: true
      },
      journey: {
        useMaxWidth: true
      },
      timeline: {
        useMaxWidth: true
      }
    });
    
    // 主题切换支持
    setupThemeToggle();
  }
  
  function setupThemeToggle() {
    // 监听主题变化
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'data-md-color-scheme' || 
             mutation.attributeName === 'class')) {
          reinitializeMermaid();
        }
      });
    });
    
    // 观察body的属性变化
    const targetNode = document.body || document.documentElement;
    observer.observe(targetNode, {
      attributes: true,
      attributeFilter: ['data-md-color-scheme', 'class']
    });
  }
  
  function reinitializeMermaid() {
    // 检测当前主题
    const isDark = document.querySelector('[data-md-color-scheme="slate"]') !== null ||
                   document.documentElement.hasAttribute('data-theme') &&
                   document.documentElement.getAttribute('data-theme') === 'dark';
    
    // 重新配置主题
    const theme = isDark ? 'dark' : 'default';
    const themeVariables = isDark ? {
      primaryColor: '#bb86fc',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#bb86fc',
      lineColor: '#ffffff',
      secondaryColor: '#1f1f1f',
      tertiaryColor: '#333333',
      background: '#0d1117',
      mainBkg: '#161b22',
      secondBkg: '#21262d'
    } : {
      primaryColor: '#1976d2',
      primaryTextColor: '#000000',
      primaryBorderColor: '#1976d2',
      lineColor: '#333333',
      secondaryColor: '#ffffff',
      tertiaryColor: '#ffffff',
      background: '#ffffff',
      mainBkg: '#ffffff',
      secondBkg: '#f6f8fa'
    };
    
    // 重新初始化Mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: theme,
      themeVariables: themeVariables,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      sequence: {
        useMaxWidth: true,
        wrap: true
      },
      gantt: {
        useMaxWidth: true
      }
    });
    
    // 重新渲染所有图表
    setTimeout(renderAllDiagrams, 100);
  }
  
  function renderAllDiagrams() {
    const elements = document.querySelectorAll('.mermaid, pre.mermaid');
    elements.forEach(function(element, index) {
      const code = element.textContent || element.innerText;
      if (code && code.trim()) {
        try {
          element.innerHTML = '';
          element.textContent = code.trim();
          mermaid.init(undefined, element);
        } catch (error) {
          console.error('Mermaid渲染错误:', error);
          element.innerHTML = '<div style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px;">图表渲染失败: ' + error.message + '</div>';
        }
      }
    });
  }
})();