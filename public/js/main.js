$(document).ready(function(){
    $('.delete-sign').on('click', function(e){
        $target = $(e.target);
        const id = $target.attr('sign-id');
        $.ajax({
            type: 'DELETE',
            url: '/roadsign/'+id,
            success : function(response){
                alert('Sign Deleting');
                window.location.href='/';
            },
            error: function(err){
                console.log('ajax req unsuccessful',err);
            }
       })
    })
})