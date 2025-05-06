<template>
  <div class="fullscreen bg-negative text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">
        {{ $t('error404.title') }}
      </div>

      <div
        class="text-h2 text-white"
        style="opacity:.4"
      >
        {{ $t('error404.subtitle') }}
      </div>

      <q-btn
        class="q-mt-xl q-pa-sm"
        color="white"
        text-color="blue"
        unelevated
        :label="$t('error404.button')"
        no-caps
        @click="$router.go(-1)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Error404'
}
</script>
