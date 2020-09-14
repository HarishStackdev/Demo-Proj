'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Geofence=use("App/Models/Geofence")
const IotUser = use("App/Models/IotUser")
const IotTriggerRules = use("App/Models/IotTriggerRules")
const View = use('View')
const Env = use("Env")
const {site_timeout_text} = use('App/Helpers')
const {get_user_name} = use('App/Helpers');
const {get_user_id} = use('App/Helpers');
const {get_user_role} = use('App/Helpers')
const {get_tenant_id} = use('App/Helpers')
const {get_customer_id} = use('App/Helpers')

View.global('appURL', function () {
    
  const app_url = Env.get("APP_URL")
  return app_url
})
View.global('emailURL', function () {
    
  const email_url = Env.get("EMAIL_URL")
  return email_url
})
View.global('currentYear', function () {
  
  return new Date().getFullYear()
})

/**
 * Resourceful controller for interacting with geofences
 */
class GeofenceController {
  /**
   * Show a list of all geofences.
   * GET geofences
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
  }

  /**
   * Render a form to be used for creating a new geofence.
   * GET geofences/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ auth, request, session, view }) {
    try {
   
      // read for user_role name      
      var user_role = await get_user_role(session,request)                 
      // read for tenant_id
      var tenant_id = await get_tenant_id(session,request)      
      // read for customer_id      
      var customer_id = await get_customer_id(session,request)      

      // get name and  proxy user name 
      var name = await get_user_name(session,auth)
      var proxy_user_name = session.get('proxy_user_name')
    
        // get goefences
     var geofences;

    if (user_role == 'SystemAdmin') {
        geofences = await Geofence.query().orderBy('geofencename').fetch()
    }
    else
    {
        geofences = await Geofence.query().where("tenant_id", tenant_id).andWhere('customer_id',customer_id).orderBy('geofencename').fetch()
    }
    // set siteTimeOut in seconds based on site_time_out_minutes in tenants
    var siteTimeOutText = await site_timeout_text(tenant_id)
           
    
    return view.render("geofence/geofence",{name:name, proxy_user_name:proxy_user_name, user_role: user_role,geofences:geofences.toJSON(),siteTimeOutText})
      
    } 
    catch (error) 
    {
      throw error
    }
    
  }

  /**
   * Create/save a new geofence.
   * POST geofences
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ auth, session,request, response }) {
try {
      // read for tenant_id      
      var tenant_id = await get_tenant_id(session,request)      
      // read for customer_id      
      var customer_id = await get_customer_id(session,request)      

      var user_id = await get_user_id(session,request)      

      const user= await Geofence.create({
        geofencename:request.input('geofencename'),
        geojson:request.input('geofence'),
        user_id:user_id,
        customer_id:customer_id,
        tenant_id:tenant_id
      });

      return response.redirect('/geofencelist')
  
} 
catch (error) 
{
  throw error 
}
    
  }

  
    async geofencelist({view,auth,request, response, session}){
        try {

            // read for user_role name            
            var user_role = await get_user_role(session,request)                      
            // read for tenant_id            
            var tenant_id = await get_tenant_id(session,request)      
            // read for customer_id            
            var customer_id = await get_customer_id(session,request)      

            
            var geofences = null
            
            if (user_role == 'SystemAdmin') {
                
                geofences = await Geofence.query().orderBy('geofencename').with('iotuser').with('customer').fetch()
               
                
              } 
              else
              {
                geofences = await Geofence.query().orderBy('geofencename').where("tenant_id", tenant_id).andWhere('customer_id',customer_id).with('iotuser').with('customer').fetch()
              }
              //console.log(geofences.toJSON())
            // set siteTimeOut in seconds based on site_time_out_minutes in tenants
            var siteTimeOutText = await site_timeout_text(tenant_id)
      

            // get name and  proxy user name 
            var name = await get_user_name(session,auth)
            var proxy_user_name = session.get('proxy_user_name')

            return view.render('geofence/geofencelist',{geofences: geofences.toJSON(),name:name,proxy_user_name:proxy_user_name,user_role,siteTimeOutText})
        }

    catch(error){ 
        
        session.flash({GeofencelistError : error.name})
      
        response.redirect('back')
        throw error
      }
    }


    //get details of a geofence

    async getGeofence({params,request,response,view,auth,session}){
          try {

            // read for user_role name            
            var user_role = await get_user_role(session,request)      
            // read for tenant_id            
            var tenant_id = await get_tenant_id(session,request)      
            // read for customer_id            
            var customer_id = await get_customer_id(session,request)      

            var user_id = await get_user_id(session,request)      
            
     
            const geofenceid= decodeURIComponent(params.id);
            const geofencedetail =  await Geofence.query().where('id',geofenceid).fetch()
        
       
        

        const gfdetailjson = geofencedetail.toJSON()
        var geojson = JSON.stringify(gfdetailjson[0].geojson)

        var createdby = gfdetailjson[0].user_id        
        var editgeofence = 'false'
        var geofences = null

        if (user_role == 'SystemAdmin') {
                
          geofences = await Geofence.query().orderBy('geofencename').with('iotuser').with('customer').fetch()
         
          
        } 
        else
        {
          geofences = await Geofence.query().orderBy('geofencename').where("tenant_id", tenant_id).andWhere('customer_id',customer_id).with('iotuser').with('customer').fetch()
        }

        // Only admins and users who created the geofence have the ability to edit

        if (user_role === 'TenantAdmin' || user_role == 'SystemAdmin' || createdby == user_id)
        {
          editgeofence = 'true'

        }

        if (gfdetailjson[0].geojson.type)
        {

            // console.log(gfdetailjson[0].geojson.type);

             if (gfdetailjson[0].geojson.type == 'FeatureCollection'){
                var geojson1 = gfdetailjson[0].geojson.features[0]
                geojson = JSON.stringify(geojson1)
             //   console.log(geojson)

             }
        }
      //  console.log(geojson)
        // set siteTimeOut in seconds based on site_time_out_minutes in tenants
        var siteTimeOutText = await site_timeout_text(tenant_id)
                  
        // get name and  proxy user name 
        var name = await get_user_name(session,auth)
        var proxy_user_name = session.get('proxy_user_name')

        return view.render('geofence/geofencedetail',{gfdetailjson:gfdetailjson,geojson:geojson,name:name,proxy_user_name:proxy_user_name, user_role,editgeofence:editgeofence,geofences: geofences.toJSON(),siteTimeOutText})
        
      }
      catch(error){ 
          
          session.flash({GeofencelistError : error.name})
          
          response.redirect('back')
          throw error
        }

  }

  //delete geofence



  async deleteGeofence({params,request,response,view,auth,session}){

            // read for user_role name            
            var user_role = await get_user_role(session,request)          
            // read for tenant_id            
            var tenant_id = await get_tenant_id(session,request)      
            // read for customer_id            
            var customer_id = await get_customer_id(session,request)      


    const geofenceid = decodeURIComponent(params.id);
    

    try {

      var geofence =  await Geofence.query().where('id',geofenceid).first()
      const geofencejson = geofence.toJSON()
      const geofencename  = geofencejson.geofencename

      const condition = 'Geofence'
      
      const triggerRule = await IotTriggerRules.query().where('condition',condition).andWhere('condition_value1', geofenceid).fetch()
      const triggerRulejson = triggerRule.toJSON()

      if (triggerRulejson.length > 0) {

        // triggers associated with geofence and cannot  be deleted.

        const delmsg = 'You cannnot delete the geofence \'' + geofencename + '\' as there are Triggers associated with the goefence'

       
         session.flash({ DeleteMessage:delmsg})
          
         response.status(500).send(delmsg)
 
 
       }
       else{

        //no triggers associated with geofence and can be deleted.
 
            await geofence.delete()
       }


      
      var geofencelist

      if (user_role == 'SystemAdmin') {                
        geofencelist = await Geofence.query().with('iotuser').with('customer').fetch()               
      } 
      else
      {
        geofencelist = await Geofence.query().where("tenant_id", tenant_id).andWhere('customer_id',customer_id).with('iotuser').with('customer').fetch()
      }
     // console.log(geofencelist.toJSON())
    // set siteTimeOut in seconds based on site_time_out_minutes in tenants
    var siteTimeOutText = await site_timeout_text(tenant_id)
  
  

          // get name and  proxy user name 
          var name = await get_user_name(session,auth)
          var proxy_user_name = session.get('proxy_user_name')
    
    return view.render('geofence/geofencelist',{geofences: geofencelist.toJSON(),name:name,proxy_user_name:proxy_user_name,user_role,siteTimeOutText})



    }
    catch(error){
      console.log(error)
      throw error

    }


  }

  //save edited or deleted geofences

  async updateGeofence({params,request,response,view,auth,session}){
    try {

        // read for user_role name        
        var user_role = await get_user_role(session,request)                      
        // read for tenant_id        
        var tenant_id = await get_tenant_id(session,request)      
        // read for customer_id        
        var customer_id = await get_customer_id(session,request)      
      
      // set siteTimeOut in seconds based on site_time_out_minutes in tenants
      var siteTimeOutText = await site_timeout_text(tenant_id)
  
  
  var geofenceid = decodeURIComponent(params.id);
  var geofencedetail =  await Geofence.query().where('id',geofenceid).first()
  
   
  var geojsonchanges = request.input('geofence')
  //console.log(geojsonchanges)
  var editgeofence = 'true'

  var geofences;

 

   // console.log(geofences.toJSON())

  if (geojsonchanges === 'delete')
  {

    const geofencejson = geofencedetail.toJSON()
    const condition = 'Geofence'
    const gfenceid  = geofencejson.id

    const triggerRule = await IotTriggerRules.query().where('condition',condition).andWhere('condition_value1', gfenceid).fetch()
    const triggerRulejson = triggerRule.toJSON()

          if (triggerRulejson.length > 0) {

            

          // console.log('Count')
          geofencedetail =  await Geofence.query().where('id',geofenceid).first()

        
          session.flash({ GeofencelistError:'You cannnot delete the geofence as there are Triggers associated with the goefence'})
          

          return response.redirect('back')


        }
        else{



                //  console.log('delete')
                 await geofencedetail.delete()

                 if (user_role == 'SystemAdmin') {
                
                  geofences = await Geofence.query().with('iotuser').with('customer').fetch()
                 
                  
                } 
                else
                {
                  geofences = await Geofence.query().where("tenant_id", tenant_id).andWhere('customer_id',customer_id).with('iotuser').with('customer').fetch()
                }
                  
                  
              // get name and  proxy user name 
              var name = await get_user_name(session,auth)
              var proxy_user_name = session.get('proxy_user_name')

                return view.render('geofence/geofencelist',{geofences: geofences.toJSON(),name:name,proxy_user_name:proxy_user_name,user_role,siteTimeOutText})
        }

  }
  else {

    geofencedetail.geojson = geojsonchanges
    var gfdetailjson = geofencedetail.toJSON()
   // console.log('Save ' + JSON.stringify(gfdetailjson))
    await geofencedetail.save()
   // console.log('geofencelist after save' + geofencedetail)

   geofencedetail =  await Geofence.query().where('id',geofenceid).fetch()

  //  console.log('List' + geofencelist)
    gfdetailjson = geofencedetail.toJSON()
    var geojson = JSON.stringify(gfdetailjson[0].geojson)

    if (gfdetailjson[0].geojson.type)
    {

     //     console.log(gflistjson[0].geojson.type);

          if (gfdetailjson[0].geojson.type == 'FeatureCollection'){
            var geojson1 = gfdetailjson[0].geojson.features[0]
            geojson = JSON.stringify(geojson1)
    //        console.log(geojson)

          }
    }


    if (user_role == 'SystemAdmin') {
                
      geofences = await Geofence.query().with('iotuser').with('customer').fetch()
     
      
    } 
    else
    {
      geofences = await Geofence.query().where("tenant_id", tenant_id).andWhere('customer_id',customer_id).with('iotuser').with('customer').fetch()
    }
      
                      
   // get name and  proxy user name 
   var name = await get_user_name(session,auth)
   var proxy_user_name = session.get('proxy_user_name')
   return view.render('geofence/geofencedetail',{gfdetailjson:gfdetailjson,geojson:geojson,name:name,proxy_user_name:proxy_user_name, user_role,editgeofence:editgeofence,geofences: geofences.toJSON(),siteTimeOutText})
   
  }
   
}
catch(error){ 

    session.flash({GeofencelistError : error.name})
    console.log(error)
    throw error
  }

}

async geofenceNameFetch({request,response,session}){
  try{
    // read for user_role name    
    var user_role = await get_user_role(session,request)                      
    // read for tenant_id    
    var tenant_id = await get_tenant_id(session,request)      
    // read for customer_id    
    var customer_id = await get_customer_id(session,request)      

    var geofenceName = null
    if(user_role == "SystemAdmin"){
      geofenceName = await Geofence.query().fetch()
    }
    else{
      geofenceName = await Geofence.query().where('tenant_id', tenant_id).fetch()
    }
    response.send(geofenceName.toJSON())
  }
  catch(error){
    throw error
  }
}

}

module.exports = GeofenceController
