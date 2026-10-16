# Генерирует большие тестовые картинки для test/qa/upload.py (в проект не кладём: ~19 МБ)
# Запуск: python3 test/fixtures/make_big.py
import numpy as np
from PIL import Image
img = Image.fromarray((np.random.rand(2000, 3000, 3) * 60 + np.linspace(0, 190, 3000)[None, :, None]).astype('uint8'))
img.save('test/fixtures/big.png')
img.save('test/fixtures/big.jpg', quality=95)
