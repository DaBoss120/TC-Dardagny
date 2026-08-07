<?php
// src/includes/footer.php
// Common script includes, appended before </body> on every page.
// Individual pages can set $page_scripts = ['agenda.js', ...] before including this file
// to load additional, page-specific scripts.
?>
<script src="/js/script.js"></script>
<?php if (!empty($page_scripts) && is_array($page_scripts)): ?>
<?php foreach ($page_scripts as $script): ?>
<script src="/js/<?php echo htmlspecialchars($script, ENT_QUOTES, 'UTF-8'); ?>"></script>
<?php endforeach; ?>
<?php endif; ?>
