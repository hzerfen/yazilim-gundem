# Yazılım Gündem

Yazılım dünyasının o günkü önemli haberlerini, makalelerini ve projelerini tek sayfada toplayan, kendiliğinden güncellenen bir haber panosu. Sunucu ya da API anahtarı gerektirmez.

## Nasıl çalışır?

1. `scripts/fetch-news.mjs` anahtarsız, ücretsiz kaynaklardan veri çeker ve `news.json` dosyasına yazar.
2. `.github/workflows/update.yml` bu betiği **her saat başı** çalıştırır; değişiklik varsa `news.json`'u commit'ler.
3. `.github/workflows/pages.yml` her `main` push'unda siteyi GitHub Pages'e yayınlar.
4. `index.html` `news.json`'u okuyup haberleri gösterir.

## Kaynaklar

| Kaynak | Ne çekilir |
| --- | --- |
| Hacker News | Öne çıkan ilk 30 haber |
| DEV.to | Haftanın en çok okunan yazıları |
| Lobsters | En sıcak gönderiler |
| GitHub | Son 7 günde açılan, en çok yıldızlanan depolar |
| Hugging Face | Günün makaleleri (daily papers) |

Bir kaynak hata verirse boş liste yazılır, diğerleri etkilenmez.

## Yerelde çalıştırma

Node.js 22 gerekir.

```bash
node scripts/fetch-news.mjs   # news.json'u günceller
npx serve .                   # ya da herhangi bir statik sunucu
```

## Yapı

```
index.html                    # arayüz
news.json                     # otomatik üretilen veri
scripts/fetch-news.mjs        # haber toplayıcı
.github/workflows/update.yml  # saatlik güncelleme
.github/workflows/pages.yml   # GitHub Pages yayını
```
