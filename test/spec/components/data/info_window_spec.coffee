define ['jquery'], ($) ->

  describeComponent 'map/components/data/info_window', ->

    beforeEach ->
      @setupComponent()
      @listingId = 1111
      @ev = {}
      @data = 
        listingId: @listingId

    it 'should be defined', ->
      expect(@component).toBeDefined()

    describe '#getData', ->
      it 'creates a url', ->
        xhrSpy = spyOn($, 'ajax')
        spyOn(@component, 'getRefinements').and.callFake( -> 'foo_bar_baz-1')
        expectedUrl = "#{@component.attr.pinRoute}#{@listingId}?refinements=foo_bar_baz-1"
        @component.getData(@ev, @data)
        expect(xhrSpy.calls.mostRecent().args[0]['url']).toEqual expectedUrl

      it 'triggers an event on success', ->
        spyOn($, 'ajax').and.callFake( (params) -> params.success {foo:'bar'} )
        spyOnEvent document, 'infoWindowDataAvailable'
        @component.getData(@ev, @data)
        expect('infoWindowDataAvailable').toHaveBeenTriggeredOnAndWith(document, foo:'bar')
