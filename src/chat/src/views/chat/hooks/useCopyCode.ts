import { copyText } from '@/utils/format';
import { onMounted, onUpdated } from 'vue';

export function useCopyCode() {
  function copyCodeBlock() {
    const codeBlockWrapper = document.querySelectorAll('.code-block-wrapper');
    codeBlockWrapper.forEach((wrapper) => {
      const copyBtn = wrapper.querySelector('.code-block-header__copy');
      const codeBlock = wrapper.querySelector('.code-block-body');
      if (copyBtn && codeBlock) {
        copyBtn.addEventListener('click', () => {
          if (navigator.clipboard?.writeText) {
            // window.$message?.success('複製成功!');
            navigator.clipboard.writeText(codeBlock.textContent ?? '');
          } else {
            copyText({ text: codeBlock.textContent ?? '', origin: true });
          }
        });
      }
    });
  }

  onMounted(() => copyCodeBlock());

  onUpdated(() => copyCodeBlock());
}
